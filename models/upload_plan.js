 

const connection = require("../connection")

const fs = require('fs')
const fse = require('fs-extra')
const readXlsxFile = require('read-excel-file/node');

const programdefault = ['ЗОП', 'ОПП'];
const planindchar = 'Е';
const pckedupracticdefault = ['КІ', 'ІПЗ'];
const newplan = "1 - Е00";
const stepprogram = 19,
  stepsemestr1 = 26,
  steplecture = 27,
  steplab = 28,
  steppractic = 29,
  stepcoursework = 31,
  stepexam = 33,
  stepcredit = 34,
  steppck = 45,
  step = 10,
  stepedupractic = 20;


const obtainGroupCourse = async () => {  
  const result = await connection.query("select  _id , name, course from groups group by course, name,_id order by course asc;");
  return result.rows;
}
const obtainPlanid = async () => {  

   const result = await connection.query(   `SELECT  planindex(hours, groups) as planind, 
   count( distinct subjectid) as numsubjects FROM hours, groups
   WHERE hours.groupid=groups._id group by planind order by planind asc`);
  return result.rows;
}
const obtainSubjectPck = async () => {
  
   const result = await connection.query(`select  subjects._id as subjectid , fullname, pck.abr as abr, pck._id as pckid, programs
   from subjects, pck 
   WHERE subjects.pckid=pck._id
   order by abr asc`);
  return result.rows;
}

const deletePlanind = async (planind) => {
  let q = `DELETE FROM public.hours t1
  WHERE exists (SELECT  planindex(t1, t2)
  FROM  groups t2 WHERE t1.groupid=t2._id AND  planindex(t1, t2) ='${planind}')`;
   
  let result = await connection.query(q);
  return result;
}
function showWarning(hours) {
  
  let message = `<h3>Перевірте предмети. </h3>
  <h6>Додайте, чи скорегуйте таблицю - subjects</h6>
  <ol style="coplor:red">`;
  let message1 = `<h3>Перевірте ПЦК. </h3>
  <h6>Додайте, чи скорегуйте таблицю - pck</h6>
  <ol style="coplor:red">`;
  let footer = '</ol>';

  let arr = [];
  let arr1 = [];
  hours.forEach((hour) => {

    if (hour.subjectid == 0) {
      arr.push(hour.subject);
      
    }
    if (hour.pckid == 0) {
      arr1.push(hour.pck);
    }
  });

  let unique = [];
  if (arr.length) {
    unique = [...new Set(arr)];
    for (un of unique) {
     
      message = message + `<li> subjects.fullname=${un}</li>`;
    }
    message = message + footer;
  }
  else
    message = '';

  unique.length = 0;


  if (arr1.length) {
    unique = [...new Set(arr1)];
    for (let un of unique) {
      message1 = message1 + `<li> pck.abr=${un}</li>`;
    }
    message1 = message1 + footer;
  }
  else
    message1 = '';


  let msg = message + message1;
  
  if (msg)
    msg = msg + `</br><a href="/subjects">Назад до предметів subjects</a>`;
 
  return msg;
}

let bulkInsert = async (hours, planind, groupid, newplan) => {

  let edited = false;
  if (planind != newplan) {
    //delete then insert, 
    try {
      deletePlanind(planind);
      edited = true;
    } catch (err) {
      console.error(err);
      return res.status(500).send({
        message: "Could not delete planind = " + planind,
      });
    }
  }

  let str = `insert into hours
  (groupid, subjectid, pckid, semestr, lectures, labs, practices,  courseworks, exams, credits, edupractice, edited)
  values `;
  let q = ``;
  hours.forEach((hour) => {
    q = `( ${groupid}, ${hour.subjectid}, ${hour.pckid}, '${hour.semestr}', 
    
      ${hour.lectures}, ${hour.labs}, ${hour.practices}, ${hour.courseworks},
      ${hour.exams}, ${hour.credits}, ${hour.edupractice}, ${edited} ),`;
    str = str + q;

  });

  q = str.slice(0, -1);
 
  let result = await connection.query(q);
  return result;



};
function upload(req, res) {
  try {
    if (req.file == undefined) {
      return res.status(400).send("Please upload an excel file!");
    }
    //variables from form
    const {
      groupid,
      numsubject,
      numrowsubject,
      numcolsubject,
      numpract1,
      numrowpract1,
      numcolpract1,
      numpract2,
      numrowpract2,
      numcolpract2,
      planind
    } = req.body;
    if (!groupid || !numsubject || !planind) {
      return res.status(500).send("No groupid, numsubject,planind");
    }

    let path = __basedir + "/public/assets/uploads/tmp/" + req.file.filename;
     
    readXlsxFile(path).then((rows) => {
      // skip header  rows.shift();
      let rowstart = numrowsubject - 1;
      while (rowstart) {
        rows.shift();
        rowstart--;
      }
      if (numsubject > rows.length) {
        return res.status(500).send({
          message: "numsubject > rows.length  "
          
        });
      }
      let hours = [];

      let start = numcolsubject - 1;

      for (let i = 0; i < numsubject; i++) { 

        if (rows[i][start + stepsemestr1]) {
          let hour = {};
          hour.semestr = 1;
          hour.subject = rows[i][start];
          hour.program = programdefault[0];  
          if (rows[i][start + stepprogram] !== programdefault[0])
            hour.program = programdefault[1];
          hour.pck = rows[i][start + steppck];
          hour.lectures = Number(rows[i][start + steplecture]);
          hour.labs = Number(rows[i][start + steplab]);
          hour.practices = Number(rows[i][start + steppractic]);
          hour.courseworks = Number(rows[i][start + stepcoursework]);
          hour.exams = Number(rows[i][start + stepexam]);
          hour.credits = Number(rows[i][start + stepcredit]);
          hour.edupractice = 0;

          hours.push(hour);

        }

        if (rows[i][start + stepsemestr1 + step]) {
          let hour = {};
          hour.semestr = 2;
          hour.subject = rows[i][start];
          hour.program = programdefault[0];  
          if (rows[i][start + stepprogram] !== programdefault[0])
            hour.program = programdefault[1];
          hour.pck = rows[i][start + steppck];

          hour.lectures = Number(rows[i][start + steplecture + step]);
          hour.labs = Number(rows[i][start + steplab + step]);
          hour.practices = Number(rows[i][start + steppractic + step]);
          hour.courseworks = Number(rows[i][start + stepcoursework + step]);
          hour.exams = Number(rows[i][start + stepexam + step]);
          hour.credits = Number(rows[i][start + stepcredit + step]);
          hour.edupractice = 0;

          hours.push(hour);
        }

      }
      
      if (numpract1) {
        if (!numsubject)
          rowstart = numrowpract1 - 1;

        else
          rowstart = numrowpract1 - numrowsubject;
        while (rowstart) {
          rows.shift();
          rowstart--;
        }
        if (numpract1 > rows.length) {
          return res.status(500).send({
            message: "numpract1 > rows.length  "
             
          });
        }
        start = numcolpract1 - 1;
        for (let i = 0; i < numpract1; i++) {

          let hour = {};
          hour.subject = rows[i][start];
          hour.program = programdefault[1];
          let res = planind.charAt(planind.length - 3);
          if (res == planindchar)
            hour.pck = pckedupracticdefault[0];

          else
            hour.pck = pckedupracticdefault[1];

          hour.semestr = 1;
          hour.lectures = 0;
          hour.labs = 0;
          hour.practices = 0;
          hour.courseworks = 0;
          hour.exams = 0;
          hour.credits = 0;
          hour.edupractice = Number(rows[i][start + stepedupractic]);

          hours.push(hour);

        }
      }

      if (numpract2) {

        if (numpract1)
          rowstart = numrowpract2 - numrowpract1;
        if (numsubject && !numpract1)
          rowstart = numrowpract2 - numrowsubject;
        if (!numsubject && !numcolpract1)
          rowstart = numrowpract2 - 1;


        while (rowstart) {
          rows.shift();
          rowstart--;
        }



        if (numpract2 > rows.length) {
          return res.status(500).send({
            message: "numpract2 > rows.length  "
             
          });
        }
        start = numcolpract2 - 1;

        for (let i = 0; i < numpract2; i++) {

          let hour = {};
          hour.subject = rows[i][start];
          hour.program = programdefault[1];
          let res = planind.charAt(planind.length - 3);
          if (res == planindchar)
            hour.pck = pckedupracticdefault[0];

          else
            hour.pck = pckedupracticdefault[1];

          hour.semestr = 2;
          hour.lectures = 0;
          hour.labs = 0;
          hour.practices = 0;
          hour.courseworks = 0;
          hour.exams = 0;
          hour.credits = 0;
          hour.edupractice = Number(rows[i][start + stepedupractic]);
           
          hours.push(hour);

        }
      }
       
      obtainSubjectPck()
        .then((subjects) => {
          
          hours.forEach((hour) => {

            let i = subjects.findIndex(item => item.fullname == hour.subject);
            if (i != -1)
              hour.subjectid = subjects[i].subjectid;
            else
              hour.subjectid = 0;

            let j = subjects.findIndex(item => item.abr == hour.pck);
             
            if (j != -1)
              hour.pckid = subjects[i].pckid;
            else
              hour.pckid = 0;
          });
         
          let msg = showWarning(hours);

          if (msg != '') {
            return res.status(200).send(msg
               
            );
          }

          

          bulkInsert(hours, planind, groupid, newplan)

            .then(async () => {

              try {
                let p = __basedir + "/public/assets/uploads/tmp/";
                await fse.emptyDir(p);
                console.log('success!');
              } catch (err) {
                console.error(err);
                return res.status(500).send({
                  message: "Could not empty dir: " + p,
                });
              }
            })
            .then(() => {

              res.redirect("/upload_plan");
              
            })
            .catch((error) => {
              return res.status(500).send({
                message: "Fail to import data into database!",
                error: error.message,
              });
            });
        })
        .catch(err => {
          return res.status(500).send("Error get subjectspck");
        });

        


    });



  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Could not upload the file: " + req.file.originalname,
    });
  }

}


module.exports = {
  upload,
  obtainGroupCourse,
  obtainPlanid,
  deletePlanind
  
};