
const connection = require("../connection")
 
const excel = require("exceljs");


const obtainTeachEduload = async () => {  
  const result = await connection.query(`SELECT row_number() over() as id, 
  a.name, hyear_zop_b, avghyear_zop_b, hyear_opp_b, avghyear_opp_b,  hyear_zop_c, hyear_opp_c,
 (avghyear_zop_b + avghyear_opp_b + hyear_opp_c+ hyear_zop_c) as avghyear_total,
 (hyear_zop_b + hyear_opp_b + hyear_opp_c+ hyear_zop_c) as hyear_total,
(avghyear_zop_b + avghyear_opp_b) as pay_total
 FROM (
SELECT 
  teachers.name,
  sum(case when  subjects.programs='ЗОП'  AND groups.dogovor=false  then teachload.total else 0 end) as hyear_zop_b,
   floor(0.97*sum(case when  subjects.programs='ЗОП'  AND groups.dogovor=false  then teachload.total else 0 end)) as avghyear_zop_b,
    sum(case when  subjects.programs='ОПП'  AND groups.dogovor=false  then teachload.total else 0 end) as hyear_opp_b,
   floor(0.97*sum(case when  subjects.programs='ОПП'  AND groups.dogovor=false  then teachload.total else 0 end)) as avghyear_opp_b,
     sum(case when  subjects.programs='ОПП'  AND groups.dogovor=true  then teachload.total else 0 end) as hyear_opp_c,
	 sum(case when  subjects.programs='ЗОП'  AND groups.dogovor=true  then teachload.total else 0 end) as hyear_zop_c
      FROM teachers,   subjects, teachload, eduload, groups where 
        eduload._id=eduloadid 
    AND eduload.groupid=groups._id AND eduload.subjectid=subjects._id AND teachload.teacherid= teachers._id
       GROUP BY  teachers.name
        order by teachers.name) as a`);
  return result.rows;
}

const obtainTeachEduloadFinish = async () => { 
  const result = await connection.query(`
  SELECT row_number() over() as id, 
  a.name, hyear_zop_b, avghyear_zop_b, hyear_opp_b, avghyear_opp_b,  hyear_zop_c, hyear_opp_c,
 (avghyear_zop_b + avghyear_opp_b + hyear_opp_c+ hyear_zop_c) as avghyear_total,
 (hyear_zop_b + hyear_opp_b + hyear_opp_c+ hyear_zop_c) as hyear_total,
(avghyear_zop_b + avghyear_opp_b) as pay_total
 FROM (
SELECT 
  teachers.name,
  sum(case when  subjects.programs='ЗОП'  AND groups.studentsbudget >0  
	  then teachload.total- floor(teachload.total * groups.studentsdogovor/(groups.studentsbudget+groups.studentsdogovor))
	  else 0 end) as hyear_zop_b,
   floor(0.97*sum(case when  subjects.programs='ЗОП'  AND groups.studentsbudget >0   
				  then teachload.total- floor(teachload.total * groups.studentsdogovor/(groups.studentsbudget+groups.studentsdogovor))
				  else 0 end)) as avghyear_zop_b,
    sum(case when  subjects.programs='ОПП'  AND groups.studentsbudget >0  
		then teachload.total- floor(teachload.total * groups.studentsdogovor/(groups.studentsbudget+groups.studentsdogovor))
		else 0 end) as hyear_opp_b,
   floor(0.97*sum(case when  subjects.programs='ОПП'  AND groups.studentsbudget >0  
		then teachload.total- floor(teachload.total * groups.studentsdogovor/(groups.studentsbudget+groups.studentsdogovor))
				  else 0 end)) as avghyear_opp_b,
     sum(case when  subjects.programs='ОПП'  AND groups.studentsdogovor >0
		 then floor(teachload.total * groups.studentsdogovor/(groups.studentsbudget+groups.studentsdogovor)) else 0 end) as hyear_opp_c,
	 sum(case when  subjects.programs='ЗОП'  AND groups.studentsdogovor >0
		 then floor(teachload.total * groups.studentsdogovor/(groups.studentsbudget+groups.studentsdogovor)) else 0 end) as hyear_zop_c
      FROM teachers,   subjects, teachload, eduload, groups where 
        eduload._id=eduloadid 
    AND eduload.groupid=groups._id AND eduload.subjectid=subjects._id AND teachload.teacherid= teachers._id
       GROUP BY  teachers.name
        order by teachers.name) as a
  `);
  return result.rows;
}


let path = __basedir + "/public/assets/uploads/templates/teach_eduload_tmpl.xlsx";//+ req.file.filename;
 
async function processData1(res,data1,finish){
  let dNow = new Date();

  
  let year=dNow.getFullYear();
  let stryear=`${year} - ${year+1}`;
  let title=`Педагогічне навантаження викладачів на ${stryear} рік`;
let celtitele='B1', celfirst='A5';
 
  let path = __basedir + "/public/assets/uploads/templates/teach_eduload_tmpl.xlsx";
  

 let sourceWorkbook = new excel.Workbook();
 sourceWorkbook = await sourceWorkbook.xlsx.readFile(path);
 const sourceWorksheet = sourceWorkbook.getWorksheet(1);
 sourceWorksheet.getCell(celtitele).font = {
  name: 'Arial Cyr',
 
  size: 12,
 
};

 sourceWorksheet.getCell(celtitele).value = title;
 
let colstyle= { font: { name: 'Times New Roman',size: 12 },border: {
  top: {style:'thin'},
  left: {style:'thin'},
  bottom: {style:'thin'},
  right: {style:'thin'}
} }
 sourceWorksheet.columns = [
  {  key: 'id', width: 4, },
  {  key: 'name', width: 32, style:  colstyle},
  {  key: 'hyear_zop_b', width: 10, style: colstyle  },
  {  key: 'avghyear_zop_b', width: 10, style: colstyle },
  {  key: 'hyear_opp_b', width: 10, style: colstyle },
  {  key: 'avghyear_opp_b', width: 10, style: colstyle },
  {  key: 'hpay', width: 10, style: colstyle },
  {  key: 'hyear_zop_c', width: 10, style: colstyle },
  {  key: 'hyear_opp_c', width: 10, style: colstyle },
  {  key: 'avghyear_total', width: 10, style: colstyle },
  {  key: 'hyear_total', width: 10, style: colstyle },
  {  key: 'pay_total', width: 10, style: colstyle } ];

let start=5;
let letter=['C','D','E','F','G','H','I','J','K','L'];
let sumval = (prop)=>data1.reduce(function(a, b) {
  return a + Number(b[prop]);
}, 0) ;
let arrsumval=[sumval('hyear_zop_b'),sumval('avghyear_zop_b'),sumval('hyear_opp_b'),
sumval('avghyear_opp_b'), 0,
sumval('hyear_zop_c'),sumval('hyear_opp_c'), sumval('avghyear_total'),sumval('hyear_total'),
sumval('pay_total') ];
 
for(let row of data1){
for(let key in row) {
  if(key!='name')
  row[key]=Number(row[key]);
  else
  row[key]=row[key];
}
row['hpay']=0;
}
console.log(data1);
 const insertedRowsOriginal = sourceWorksheet.insertRows(start, data1,'o');
 let col1=sourceWorksheet.getColumn('avghyear_total');
 col1.eachCell(function(cell, rowNumber) {
   if(rowNumber>=start){
   let cellformula1=`=D${rowNumber} + F${rowNumber} + H${rowNumber} + I${rowNumber}`;
   

   if(rowNumber-start+1<=data1.length)
  cell.value = { formula: cellformula1, result:data1[rowNumber-start].avghyear_total};
   
}
});
let col2=sourceWorksheet.getColumn('hyear_total');
 col2.eachCell(function(cell, rowNumber) {
   if(rowNumber>=start){   
   let cellformula2=`=C${rowNumber} + E${rowNumber} + G${rowNumber} + H${rowNumber} + I${rowNumber}`;   
   if(rowNumber-start+1<=data1.length)
  cell.value = { formula: cellformula2, result:data1[rowNumber-start].hyear_total}; 
}
});

let col3=sourceWorksheet.getColumn('pay_total');
 col3.eachCell(function(cell, rowNumber) {
   if(rowNumber>=start){   
   let cellformula3=`=D${rowNumber} + F${rowNumber}`;   
   if(rowNumber-start+1<=data1.length)
  cell.value = { formula: cellformula3, result:data1[rowNumber-start].pay_total}; 
}
});


  
 let lengthdata=data1.length;
 
 for(const [ i, lettercell] of letter.entries() ){
 let cellstart=lettercell+`${start}`;
let celllast=lettercell+`${start+lengthdata-1}`;
 let celltotal=lettercell+`${start+lengthdata}`;
let cellformula=`=SUM(${cellstart},${celllast})`;
 
sourceWorksheet.getCell(celltotal).value = { formula: cellformula, result:arrsumval[i]}
 }

  
 res.setHeader(
  "Content-Type",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
);
//leaderpck_1.xlsx
let str='';
if(finish) str='_finish';
res.setHeader(
  "Content-Disposition",
  "attachment; filename=" + "teach_eduload_"+ str+".xlsx"
);

return sourceWorkbook.xlsx.write(res).then(function () {
  res.status(200).end();
});
}

async function  processTeachEduload(res, numbutton){
  try{
    let  data1=[], finish=false;
    switch(numbutton){
      case  '1':{
          data1= await obtainTeachEduload();
          finish=false;
          
           break;
      }
      case  '2':{
        data1= await obtainTeachEduloadFinish();
        finish=true;
            
           break;
      }
    }
    let data={};
    data=await processData1(res,data1,finish);

    
  }
  catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Could not download the file: ", 
    });
  }
}


module.exports = {
  
  processTeachEduload
};