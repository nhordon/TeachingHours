
const connection = require("../connection")
const createReport = require('docx-templates').default;

const fs = require('fs')
const fse = require('fs-extra')



const obtainTeachCard = async (dogovor) => {  
  const result = await connection.query(`

  SELECT  teach1.name, sub1.name as subject, gr1.name as group,
teachload.lectures as lectures1,  teachload.practices as practices1, teachload.labs as labs1,
teachload.exams as exams1, 
(
subselect(teach1,gr1,sub1, teachload.lectures, ${dogovor}  )
) lectures2,
(
subselect(teach1,gr1,sub1, teachload.practices , ${dogovor}  )
) practices2,
(
subselect(teach1,gr1,sub1, teachload.labs , ${dogovor} )
) labs2,
(
subselect(teach1,gr1,sub1, teachload.exams , ${dogovor} )
) exams2,
(	
	subselectgroup(teach1,gr1,sub1,teachload.consultations,  ${dogovor} )
) consultations,
(
subselectgroup(teach1,gr1,sub1,teachload.credits, ${dogovor} )
) credits,
(
	subselectgroup(teach1,gr1,sub1,teachload.courseworks, ${dogovor} )
) courseworks,
(
subselectgroup(teach1,gr1,sub1,teachload.edupractice, ${dogovor} )
) edupractice,
(
subselectgroup(teach1,gr1,sub1, teachload.diplompractice, ${dogovor} )
) diplompractice,
(
subselectgroup(teach1,gr1,sub1, teachload.statexam, ${dogovor} )
) statexam,
(
subselectgroup(teach1,gr1,sub1,  teachload.total, ${dogovor} )
)  total
	FROM teachers teach1, subjects sub1,  groups gr1, teachload left join  eduload on eduload._id=teachload.eduloadid 
	where  gr1.dogovor= ${dogovor}  
	AND eduload.groupid=gr1._id AND eduload.subjectid=sub1._id AND teachload.teacherid= teach1._id
	AND eduload.semestr='1'	
	order by teach1.name, sub1.name, gr1.name
 `);

 
  return result.rows;
}

const obtainTeachCardFinish = async (dogovor) => {  
  let str=``;
  if(dogovor==false)
  str=`studentsbudget`;
  else str=`studentsdogovor`;
  const result = await connection.query(`
  SELECT  teach1.name, sub1.name as subject, gr1.name as group,
  finishcase(gr1, teachload.lectures,${dogovor}) as lectures1,   finishcase(gr1, teachload.practices,${dogovor}) as practices1, 
	finishcase(gr1, teachload.labs,${dogovor}) as labs1, finishcase(gr1,  teachload.exams ,${dogovor}) as exams1, 
  (
  subselectfinish(teach1,gr1,sub1, teachload.lectures, ${dogovor}  )
  ) lectures2,
  (
  subselectfinish(teach1,gr1,sub1, teachload.practices , ${dogovor}  )
  ) practices2,
  (
  subselectfinish(teach1,gr1,sub1, teachload.labs , ${dogovor} )
  ) labs2,
  (
  subselectfinish(teach1,gr1,sub1, teachload.exams , ${dogovor} )
  ) exams2,
  (	
    subselectgroupfinish(teach1,gr1,sub1,teachload.consultations,  ${dogovor} )
  ) consultations,
  (
  subselectgroupfinish(teach1,gr1,sub1,teachload.credits, ${dogovor} )
  ) credits,
  (
    subselectgroupfinish(teach1,gr1,sub1,teachload.courseworks, ${dogovor} )
  ) courseworks,
  (
  subselectgroupfinish(teach1,gr1,sub1,teachload.edupractice, ${dogovor} )
  ) edupractice,
  (
  subselectgroupfinish(teach1,gr1,sub1, teachload.diplompractice, ${dogovor} )
  ) diplompractice,
  (
  subselectgroupfinish(teach1,gr1,sub1, teachload.statexam, ${dogovor} )
  ) statexam,
  (
  subselectgroupfinish(teach1,gr1,sub1,  teachload.total, ${dogovor} )
  )  total
    FROM teachers teach1, subjects sub1,  groups gr1, teachload left join  eduload on eduload._id=teachload.eduloadid 
    WHERE  
    gr1.${str} >0
    AND eduload.groupid=gr1._id AND eduload.subjectid=sub1._id AND teachload.teacherid= teach1._id
    AND eduload.semestr='1'	
    order by teach1.name, sub1.name, gr1.name
  `);
  
  return result.rows;
}

 
async function processData1(data1, data2) {
  let dNow = new Date();

   
  let year = dNow.getFullYear();
  let stryear = `${year}/${year + 1}`;
 
  let toStr = (dd) => {
    dd.forEach(el => {

      for (let key in el) {
        if (Number(el[key]) == 0 || el[key] == null)
          el[key] = '';
      }
    });
    return dd;
  }
  data1 = toStr(data1);
  data2 = toStr(data2);
  //obtain  unique names
  let mySet = new Set([...data1.map((e) => e.name),
  ...data2.map((e) => e.name)]);
  let teachname = [...mySet];//destruct Set to array
  let data = {
    years: stryear,
    teachers: [],
  };

  for (let t of teachname) {
    let teacher = {};
    teacher.name = t;

    let budget = data1.filter((el) => {
      return el.name == t;
    });
    if (budget.length > 0) {
      let total_b = budget.reduce(function (a, b) {
        return a + Number(b.total);
      }, 0);
      teacher.budget = budget;
      teacher.total_b = total_b;
      teacher.order = Math.floor(total_b * 0.97);
      teacher.budget_flag = 1;
    }
    else {
      teacher.budget = [];
      teacher.total_b = 0;
      teacher.order = 0;
      teacher.budget_flag = 0;
    }
    let contract = data2.filter((el) => {
      return el.name == t;
    });
    if (contract.length > 0) {
      let total_c = contract.reduce(function (a, b) {
        return a + Number(b.total);
      }, 0);
      teacher.contract = contract;
      teacher.total_c = total_c;
      teacher.contract_flag = 1;
    }
    else {
      teacher.contract = [];
      teacher.total_c = 0;
      teacher.contract_flag = 0;
    }
    data.teachers.push(teacher);

  }
  

  return data;

}
async function delFilesWord() {


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

}
async function processTeachCard(res, numbutton) {

  try {
    let tmplname = 'teach_eduload_card_tmpl.docx', data1 = [], data2 = [], finish = false;
    switch (numbutton) {
      case '1': {
        data1 = await obtainTeachCard(false);//budget
        data2 = await obtainTeachCard(true);//contract
        
        break;
      }
      case '2': {
        data1 = await obtainTeachCardFinish(false);//budget 
        data2 = await obtainTeachCardFinish(true);//contact
        finish = true;
        
        break;
      }
    }
    let data = {};
 
    data = await processData1(data1, data2);

    

    let path = __basedir + "/public/assets/uploads/templates/" + tmplname;
     

    const template = fs.readFileSync(path);
    try {
      const buffer = await createReport({
        template,
        data: data,
        failFast: false,
      });
      if (finish)
        tmplname = 'teach_eduload_card_finish.docx';
      else
        tmplname = 'teach_eduload_card.docx';
      let path = __basedir + "/public/assets/uploads/tmp/report_" + tmplname;

      fs.writeFileSync(path, buffer);
      res.writeHead(200, {
        'Content-Type': "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        'Content-disposition': 'attachment;filename=' + 'report_' + tmplname,
        
      });
       
      let filestream = fs.createReadStream(path);
      delFilesWord();
       
      return filestream.pipe(res); 
       
    } catch (errors) {
      if (Array.isArray(errors)) {
        
        console.log(errors);
      } else {
        
        throw errors;
      }
    }


  }
  catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Could not download the file: ", 
    });
  }

}


module.exports = {
   
  processTeachCard
};