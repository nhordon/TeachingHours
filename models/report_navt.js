
const connection = require("../connection")
const createReport = require('docx-templates').default;
const fs = require('fs');
const fse = require('fs-extra');
 

let obtainOrderTeachers = async (programs, dogovor, sovmest) => {  
  const result = await connection.query(`SELECT row_number() over() as id, count(distinct (groups.name || subjects.name)) as subnum,
  teachers.name, teachers.position, categories.name as category,
  sum(teachload.total) as hyear,floor(sum(teachload.total) - sum(teachload.total)*0.03) as avghyear, categories.payment as hpay
    FROM teachers, categories, subjects, teachload, eduload, groups where 
    subjects.programs='${programs}'  AND groups.dogovor=${dogovor} 
     AND teachers.sovmest=${sovmest}
    AND eduload._id=eduloadid 
    AND eduload.groupid=groups._id AND eduload.subjectid=subjects._id AND teachload.teacherid= teachers._id
    AND teachers.categoryid= categories._id 
    GROUP BY  teachers.name, teachers.position, categories.name,  categories.payment
    
    order by teachers.name`);
  return result.rows;
}
let obtainOrderTeachersPart = async (programs, dogovor) => { 
  const result = await connection.query(`SELECT count(distinct (groups.name || subjects.name)) as subnum,
  teachers.name, pck.abr as pckabr,
  sum(teachload.total) as hyear, categories.payment as hpay
    FROM teachers, categories, subjects, teachload, eduload, groups,pck where
    subjects.programs='${programs}'  AND groups.dogovor=${dogovor} 
     AND teachers.sovmest=true
    AND eduload._id=eduloadid 
    AND eduload.groupid=groups._id AND eduload.subjectid=subjects._id AND teachload.teacherid= teachers._id
    AND teachers.categoryid= categories._id AND teachers.pckid=pck._id
    GROUP BY  teachers.name,  pck.abr,   categories.payment
    ORDER BY teachers.name`);
  return result.rows;
}
let obtainOrderSubjects = async (programs, dogovor, sovmest) => { //use in router
  const result = await connection.query(`SELECT  teachers.name, subjects.name as subject, groups.name as group,
  sum(teachload.total) as grouptotal
    FROM teachers, subjects, teachload, eduload, groups where subjects.programs='${programs}'
     AND groups.dogovor=${dogovor} AND teachers.sovmest=${sovmest}
    AND eduload._id=eduloadid 
    AND eduload.groupid=groups._id AND eduload.subjectid=subjects._id AND teachload.teacherid= teachers._id
    
    GROUP BY groups.name, teachers.name, subjects.name 
  
    
    order by teachers.name, subjects.name, groups.name
  `);
  return result.rows;
}

let  strUtil=(dogovor)=>{
  
  let util={
    str1:``,
    str2:``
  }
  if (!dogovor){
    util.str1=`teachload.total- `;
    util.str2=`groups.studentsbudget`;
  }
  else util.str2= `groups.studentsdogovor`;
  return util;
};
let obtainOrderTeachersFinish = async (programs, dogovor, sovmest) => { 
  let util=strUtil(dogovor);
  const result = await connection.query(`
    SELECT row_number() over() as id, count(distinct (groups.name || subjects.name)) as subnum,
    teachers.name, teachers.position, categories.name as category,
  sum(${util.str1} floor(teachload.total * groups.studentsdogovor/(groups.studentsbudget+groups.studentsdogovor)))::numeric(5,1)  as hyear,
  floor(0.97*sum(${util.str1} floor(teachload.total * groups.studentsdogovor/(groups.studentsbudget+groups.studentsdogovor)))) as avghyear, 
  categories.payment as hpay
      FROM teachers, categories, subjects, teachload, eduload, groups where 
      subjects.programs='${programs}'    AND teachers.sovmest=${sovmest}      
      AND ${util.str2} > 0
      AND eduload._id=eduloadid 
      AND eduload.groupid=groups._id AND eduload.subjectid=subjects._id AND teachload.teacherid= teachers._id
      AND teachers.categoryid= categories._id 
      GROUP BY  teachers.name, teachers.position, categories.name,  categories.payment
      
      ORDER BY teachers.name
  



  `);
  return result.rows;
}
let obtainOrderTeachersPartFinish = async (programs, dogovor) => { 
  let util=strUtil(dogovor);
  const result = await connection.query(`

  SELECT count(distinct (groups.name || subjects.name)) as subnum,
  teachers.name, pck.abr as pckabr,
 sum(${util.str1} floor(teachload.total * groups.studentsdogovor/(groups.studentsbudget+groups.studentsdogovor)))::numeric(5,1) as hyear, 
  categories.payment as hpay
    FROM teachers, categories, subjects, teachload, eduload, groups,pck where
    subjects.programs='${programs}'      AND teachers.sovmest=true
	 AND ${util.str2} > 0
    AND eduload._id=eduloadid 
    AND eduload.groupid=groups._id AND eduload.subjectid=subjects._id AND teachload.teacherid= teachers._id
    AND teachers.categoryid= categories._id AND teachers.pckid=pck._id
    GROUP BY  teachers.name,  pck.abr,   categories.payment
    ORDER BY teachers.name
  
  `);
  return result.rows;
}
let obtainOrderSubjectsFinish = async (programs, dogovor, sovmest) => { 
  let util=strUtil(dogovor);
  const result = await connection.query(`SELECT  teachers.name, subjects.name as subject, groups.name as group,
  sum(${util.str1} floor(teachload.total * groups.studentsdogovor/(groups.studentsbudget+groups.studentsdogovor))) as grouptotal
    FROM teachers, subjects, teachload, eduload, groups
	WHERE subjects.programs='${programs}'    AND teachers.sovmest=${sovmest}      
  AND ${util.str2} > 0
    AND eduload._id=eduloadid 
    AND eduload.groupid=groups._id AND eduload.subjectid=subjects._id AND teachload.teacherid= teachers._id    
    GROUP BY groups.name, teachers.name, subjects.name     
    ORDER BY teachers.name, subjects.name, groups.name

  `);
  return result.rows;
}

 
async function delFilesWord(){
 

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
//to get functions by its names as values
let funcs={processData1:processData1,
 

};

async function  processReport(res, numbutton,finish){
  try{
    let tmplname='', programs='', dogovor, sovmest, funcname='';
    switch(numbutton){
      case  '1':{
        tmplname='orderzop_b';
         programs= 'ЗОП';
          dogovor = false;
           sovmest = false;
           funcname='processData1';
           break;
      }
      case  '2':{
        tmplname='orderopp_b';
         programs= 'ОПП';
          dogovor = false;
           sovmest = false;
           funcname='processData1';
           break;
      }
      case  '3':{
        tmplname='orderzop_c';
         programs= 'ЗОП';
          dogovor = true;
           sovmest = false;
           funcname='processData1';
           break;
      }
      case  '4':{
        tmplname='orderopp_c';
         programs= 'ОПП';
          dogovor = true;
           sovmest = false;
           funcname='processData1';
           break;
      }
      
    }
    let data={};
    let data1=[], data2=[];
  

    if(numbutton!=5){
      if(finish==false){
 data1= await obtainOrderTeachers(programs, dogovor, sovmest).then((data)=>{
return data;
  
 });
  data2= await obtainOrderSubjects(programs, dogovor, sovmest).then((data)=>{
  return data;
   
   });
  }
  else {
    data1= await obtainOrderTeachersFinish(programs, dogovor, sovmest).then((data)=>{
      return data;
       
       });
        data2= await obtainOrderSubjectsFinish(programs, dogovor, sovmest).then((data)=>{
        return data;
          
         });
  }
 
   
     data=funcs[funcname](data1, data2);
  
}
 else { 
 
    data=await processDataPart(finish);
 
   
  tmplname='orderpart';
 }
  
 let path = __basedir + "/public/assets/uploads/templates/" + tmplname + "_tmpl.docx";
  
 
 const template = fs.readFileSync(path);
  try {
    const buffer = await createReport({
      template,
      data: data,
      failFast: false,
    });
    if(finish==true)
    tmplname+=`_finish`;
    let path = __basedir + "/public/assets/uploads/tmp/report_" + tmplname +  ".docx";
   
    fs.writeFileSync(path, buffer);
    res.writeHead(200, {
      'Content-Type': "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      'Content-disposition': 'attachment;filename=' + 'report_'+ tmplname +  '.docx',
    
  });
  
  let filestream = fs.createReadStream(path);
  delFilesWord();
  
 return  filestream.pipe(res) ; 
  } catch (errors) {
    if (Array.isArray(errors)) {
      // An array of errors likely caused by bad commands in the template.
      console.log(errors);
    } else {
      // Not an array of template errors, indicating something more serious.
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
//Show Tamplates names
async function namesTamplates(){
 
  const folder = __basedir + "/public/assets/uploads/templates/";
  
  let arrtmpldocx=[`orderzop_b_tmpl.docx`,`orderopp_b_tmpl.docx`,`orderzop_c_tmpl.docx`, 
`orderopp_c_tmpl.docx`,`orderpart_tmpl.docx`];
 let  namesArr = [];
namesArr.length=5;
fs.readdirSync(folder).forEach(file => {
  let i= arrtmpldocx.findIndex(element=>element==file);
   

  if(i>-1&&i<namesArr.length){
  
   namesArr[i]=file;
   
}
});
 

return namesArr;
}


function processData1(data1,data2){
  let dNow = new Date();

  let options = { year: 'numeric', month: 'long', day: 'numeric' };
  let date=dNow.toLocaleDateString('uk-UA', options);
  let year=dNow.getFullYear();
  let stryear=`${year}/${year+1}`;
  
  let totalhours =  data1.reduce((a, b) => a + (Number (b['hyear'] ) || 0),0);
  //infor from world tamplate for every page (max 4 pages)
  let rows1=24,
   rows2=60, 
   rows3=60,
   rows4=60, 
   rows5=60,
    rows6=54, 
    minteacherrows=5;
  let size1=0,size2=0,size3=0, size4=0,size5=0,size6=0;// number of teachers on every page
  let minteach = n => Number (n )< minteacherrows? minteacherrows : Number (n );
  
  function sumSubNum(n){
    
    return data1.slice(n).reduce((a, b) => a + ((minteach(b['subnum']) ) || 0),0);
  }
  
  let rows =0;
  if(sumSubNum(0)<=rows1)
  {
    size1=sumSubNum(0);
    size2=0;
    size3=0;
    size4=0;
    size5=0;
    size6=0;
  }
  else{
    for  (let i=0,rows=0; i< data1.length; i++)
    {
  
      rows = rows+  minteach (data1[i].subnum );
       
      if ( rows>rows1){
      size1=i;
    break;
      }    
    }
    if(sumSubNum(size1)<=rows2){
      size2=sumSubNum(size1);
      size3=0;
      size4=0;
      size5=0;
      size6=0;
  
    }
    else{
        for(let i=size1,rows=0; i< data1.length; i++)
      {
        rows = rows+  minteach (data1[i].subnum );
         
        if ( rows>rows2){
        size2=i-size1;
      break;
        }    
      }
      if(sumSubNum(size1+size2)<=rows3 ){
        size3=sumSubNum(size1+size2);
        size4=0;
        size5=0;
        size6=0;
      }
      else{
        for(let i=size1+size2,rows=0; i< data1.length; i++)
        {
          rows = rows+  minteach (data1[i].subnum );
          
          if ( rows>rows3){
          size3=i-size1-size2;
        break;
          }    
        }
        if(sumSubNum(size1+size2+size3)<=rows4 ){
        size4=sumSubNum(size1+size2+size3);
        size5=0;
        size6=0;
        }
        else{
          for(let i=size1+size2+size3,rows=0; i< data1.length; i++)
        {
          rows = rows+  minteach (data1[i].subnum );
          
          if ( rows>rows4){
          size4=i-size1-size2-size3;
        break;
          }    
        }
        if(sumSubNum(size1+size2+size3+size4)<=rows5 ){
        size5=sumSubNum(size1+size2+size3+size4);
        size6=0;
        }
        else{
          for(let i=size1+size2+size3+size4,rows=0; i< data1.length; i++)
          {
            rows = rows+  minteach (data1[i].subnum );
            
            if ( rows>rows5){
            size5=i-size1-size2-size3-size4;
          break;
            }    
          }
          
          size6=sumSubNum(size1+size2+size3+size4+size5);
        }

        }
  
      }
    }
  
  }
   
for(let i=0,shift=0; i<data1.length; i++){
  data1[i].subjects=[];
let second=data2.slice(shift,Number(data1[i].subnum)+shift);
 
if(second)
data1[i].subjects.push(...second);
shift=shift+ Number( data1[i].subnum);

}
 

let data={date: date,
    years: stryear,
    totalhours: totalhours
    };
    if(size1>0){
      data.teachers1=[];
      let second=data1.slice(0,size1);
      data.teachers1.push(...second);
      }
      if(size2>0){
      data.teachers2=[];
      let second=data1.slice(size1,size1+size2);
      data.teachers2.push(...second);
      }
      if(size3>0){
      data.teachers3=[];
      let second=data1.slice(size1+size2,size1+size2+size3);
      data.teachers3.push(...second);
      } 
      if(size4>0){
      data.teachers4=[]; 
      let second=data1.slice(size1+size2+size3,size1+size2+size3+size4);
      data.teachers4.push(...second);
      }
if(size5>0){
  data.teachers5=[]; 
  let second=data1.slice(size1+size2+size3+size4, size1+size2+size3+size4+size5);
  data.teachers5.push(...second);
  }
  if(size6>0){
    data.teachers6=[]; 
    let second=data1.slice(size1+size2+size3+size4+size5, size1+size2+size3+size4+size5+size6);
    data.teachers6.push(...second);
    }
  return data;
}

async function  processDataPart(finish){
let data1=[],data2=[],data3=[],data4=[],data5=[],data6=[],data7=[],data8=[];

if(finish==false){
    data1= await obtainOrderTeachersPart('ЗОП', false).then((data)=>{
    return data;     
     });
    data2= await obtainOrderSubjects('ЗОП', false, true).then((data)=>{
      return data;
     });
    data3= await obtainOrderTeachersPart('ОПП', false).then((data)=>{
        return data;
         
         });
    data4= await obtainOrderSubjects('ОПП', false, true).then((data)=>{
          return data;
          
           });
    data5= await obtainOrderTeachersPart('ЗОП', true).then((data)=>{
            return data;
            
             });
    data6= await obtainOrderSubjects('ЗОП', true, true).then((data)=>{
              return data;
             
               });
    data7= await obtainOrderTeachersPart('ОПП', true).then((data)=>{
                return data;
                
                 });
    data8= await obtainOrderSubjects('ОПП', true, true).then((data)=>{
                  return data;
                  
                   });
      }
      else{
        data1= await obtainOrderTeachersPartFinish('ЗОП', false).then((data)=>{
          return data;     
           });
          data2= await obtainOrderSubjectsFinish('ЗОП', false, true).then((data)=>{
            return data;
           });
          data3= await obtainOrderTeachersPartFinish('ОПП', false).then((data)=>{
              return data;
               
               });
          data4= await obtainOrderSubjectsFinish('ОПП', false, true).then((data)=>{
                return data;
                
                 });
          data5= await obtainOrderTeachersPartFinish('ЗОП', true).then((data)=>{
                  return data;
                  
                   });
          data6= await obtainOrderSubjectsFinish('ЗОП', true, true).then((data)=>{
                    return data;
                   
                     });
          data7= await obtainOrderTeachersPartFinish('ОПП', true).then((data)=>{
                      return data;
                      
                       });
          data8= await obtainOrderSubjectsFinish('ОПП', true, true).then((data)=>{
                        return data;
                        
                         });

      }

                       
  let dNow = new Date();

  let options = { year: 'numeric', month: 'long', day: 'numeric' };
  let date=dNow.toLocaleDateString('uk-UA', options);
  let year=dNow.getFullYear();
  let stryear=`${year}/${year+1}`;
 
 let   minteacherrows=3;
  let size1=0,size2=0,size3=0, size4=0;// number of teachers on every program
   
 if(data1.length>0)
  size1=data1.length;
  if(data3.length>0)
  size2=data3.length;
  if(data5.length>0)
  size3=data5.length;
  if(data7.length>0)
  size4=data7.length;
  

for(let i=0,shift=0; i<data1.length; i++){
  data1[i].subjects=[];
  let second=data2.slice(shift,Number(data1[i].subnum)+shift);
  if(second)
    data1[i].subjects.push(...second);
shift=shift+ Number( data1[i].subnum);
}
for(let i=0,shift=0; i<data3.length; i++){
  data3[i].subjects=[];
  let second=data4.slice(shift,Number(data3[i].subnum)+shift);
  if(second)
    data3[i].subjects.push(...second);
    shift=shift+ Number( data3[i].subnum);
}

for(let i=0,shift=0; i<data5.length; i++){
  data5[i].subjects=[];
  let second=data6.slice(shift,Number(data5[i].subnum)+shift);
  if(second)
    data5[i].subjects.push(...second);
    shift=shift+ Number( data5[i].subnum);
}
for(let i=0,shift=0; i<data7.length; i++){
  data7[i].subjects=[];
  let second=data8.slice(shift,Number(data7[i].subnum)+shift);
  if(second)
    data7[i].subjects.push(...second);
    shift=shift+ Number( data7[i].subnum);
}

 

let data={date: date,
    years: stryear
   
    };
    if(size1>0){
      data.teachers1=[];
     
      data.teachers1.push(...data1);
      }
      if(size2>0){
      data.teachers2=[];
     
      data.teachers2.push(...data3);
      }
      if(size3>0){
      data.teachers3=[];
     
      data.teachers3.push(...data5);
      } 
      if(size4>0){
      data.teachers4=[]; 
      
      data.teachers4.push(...data7);
      }
 
  return data;
}
module.exports = {
   
  processReport,
 
  namesTamplates
 
   
};