/*
2021 – Е06 format planind
hours structure:
subject, program, pck, semestr, lectures, labs, practices, 
courseworks, exams, credits, edupractice, subjectid, pckid
*/



const connection = require("../connection")


const fs = require('fs')
const fse = require('fs-extra')
const readXlsxFile = require('read-excel-file/node');
const excel = require("exceljs");


const obtainEduload = async (dogovor) => {  
  const result = await connection.query(`SELECT distinct pck._id as pckid, semestr,  
  pck.name as pckname, teachers.name as leader, subjects.name as sub, groups.course,groups.name as groupname,
  (groups.studentsdogovor + groups.studentsbudget) as studentnum,  groups.dogovor,
 lectures, practices, labs, classwork, consultations, exams, credits, courseworks, 
 edupractice, diplompractice,  statexam, total, loaddate
   FROM public.eduload,groups,subjects,pck, teachers 
   WHERE subjects._id= eduload.subjectid and subjects.pckid=pck._id and groups._id= eduload.groupid
   and pck.leaderid= teachers._id and groups.dogovor=${dogovor} AND assigned='нерозп' order by semestr, pck._id;`);
  return result.rows;
}
 
//cells in Excel
const celsemestr = 'O2',
  celdogovor = 'O3',
  celpckname = 'G2',
  celeduyear = 'M4',
  lastcolumn= 'Q';
let path = __basedir + "/public/assets/uploads/templates/leaderpck_tmpl.xlsx";//+ req.file.filename;

 async function copyExcel(eduload,  lasteduyear, dogovor, path,  res) {
  let targetWorkbook = new excel.Workbook;
  const semestrcounts = eduload.reduce((acc, value) => ({
    ...acc,
    [value.semestr]: (acc[value.semestr] || 0) + 1
  }), {});
  let eduload1 = [], eduload2 = [];
  let numsemestr1 = 0, numsemestr2 = 0;

  if (semestrcounts.length == 1) {
    if (Object.keys(semestrcounts)[0] == 1) {
      eduload1 = eduload;
      numsemestr1 = eduload.length;
    }

    else {
      eduload2 = eduload;
      numsemestr2 = eduload.length;
    }

  }
  else {
    numsemestr1 = Object.values(semestrcounts)[0];
    numsemestr2 = Object.values(semestrcounts)[1];
    eduload1 = eduload.slice(0, numsemestr1);
    eduload2 = eduload.slice(numsemestr1);
  }


  const pckcounts1 = eduload1.reduce((acc, value) => ({
    ...acc,
    [value.pckname]: (acc[value.pckname] || 0) + 1
  }), {});
  const pckcounts2 = eduload2.reduce((acc, value) => ({
    ...acc,
    [value.pckname]: (acc[value.pckname] || 0) + 1
  }), {});
  
  let sourceWorkbook = new excel.Workbook();
  sourceWorkbook = await sourceWorkbook.xlsx.readFile(path);
  const sourceWorksheet = sourceWorkbook.getWorksheet(1);
  let semestr=0;
  // 1 semester
  if(numsemestr1){
    let start = 0;
    semestr = 1;
  
    for (let countname in pckcounts1) {//loop through distinct pck
      let name = countname;
      let count = pckcounts1[countname];
      let shortpck = name.slice(0, 4);

     
      let targetWorksheet = targetWorkbook.addWorksheet(`${shortpck}${semestr}` , {
        pageSetup:{paperSize: 9, orientation:'landscape', fitToPage: true, fitToHeight: 5, fitToWidth: 1}
      } );
     
      //coping tamplate
      sourceWorksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        let targetRow = targetWorksheet.getRow(rowNumber);
        row.eachCell({ includeEmpty: false }, (cell, cellNumber) => {
          targetRow.getCell(cellNumber).value = cell.value;
         
          targetRow.getCell(cellNumber).style = cell.style;
          
        });
      
        row.commit();
      });//end coping tamplate
      targetWorksheet.columns= sourceWorksheet.columns;
      targetWorksheet.mergeCells('C2', 'F2');
      targetWorksheet.mergeCells('C4', 'L4');
      const rowl = targetWorksheet.lastRow;
 
      // Set a specific row height
      rowl.height = 60;

      targetWorksheet.getCell(celsemestr).value = semestr;
      targetWorksheet.getCell(celsemestr).alignment = { horizontal: 'right' };
      targetWorksheet.getCell(celsemestr).font = {name:'Arial Cyr',   size: 8, bold: true};
      console.log(dogovor);
      if (dogovor=='true')
       { targetWorksheet.getCell(celdogovor).value = 'контракт';}
      else {targetWorksheet.getCell(celdogovor).value = 'бюджет';}
      targetWorksheet.getCell(celpckname).value = name;
  
      let stryear = `${(lasteduyear - 1)}/${lasteduyear}`;
      targetWorksheet.getCell(celeduyear).value = stryear;
      targetWorksheet.getCell(celeduyear).font ={name:'Arial Cyr',   size: 15, bold: true};
      // content adding 
 

      for (let i = start; i < count + start; i++) {
        const row = [i + 1 - start, eduload1[i].sub, eduload1[i].groupname, 
        eduload1[i].course, eduload1[i].studentnum, eduload1[i].classwork, eduload1[i].lectures,
        eduload1[i].practices, eduload1[i].labs, eduload1[i].consultations, eduload1[i].exams,
        eduload1[i].credits, eduload1[i].courseworks, eduload1[i].diplompractice,
        eduload1[i].edupractice, eduload1[i].statexam, eduload1[i].total];
        const newRow1 = targetWorksheet.addRow(row); 
         
        
        newRow1.style.border= {
          top: {style:'thin'},
          left: {style:'thin'},
          bottom: {style:'thin'},
          right: {style:'thin'}
        }; 
        newRow1.style.font= {
          name: 'Arial Cyr',
           size: 12
         // italic: true
        };
         
        const newRow2 = targetWorksheet.addRow([]);
        newRow1.commit();
        newRow2.commit();
      }
 
      const rowValues = [];
      rowValues[6] = `Голова ПЦК ___________ (${eduload1[start].leader})`;
      start += count;
      targetWorksheet.addRow(rowValues).commit();
      let lastRow=targetWorksheet.rowCount+3;
       
      let prnt='A1:' + lastcolumn + lastRow;
     
     //for printSetup in inch
     targetWorksheet.pageSetup.margins = {  
      left: 0.55, right: 0.55,
      top: 0.55, bottom:0.55
     
    };
    // Set Print Area for a sheet
    targetWorksheet.pageSetup.printArea = prnt;
    }

  }
// 2 semester
if(numsemestr2){
  let start = 0;
  semestr = 2;
  for (let countname in pckcounts2) {//loop through distinct pck
    let name = countname;
    let count = pckcounts2[countname];
    let shortpck = name.slice(0, 4);

   
   
    let targetWorksheet = targetWorkbook.addWorksheet(`${shortpck}${semestr}` , {
      pageSetup:{paperSize: 9, orientation:'landscape',fitToPage: true, fitToHeight: 5, fitToWidth: 1}
    } );

    //coping tamplate
    sourceWorksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      let targetRow = targetWorksheet.getRow(rowNumber);
      row.eachCell({ includeEmpty: false }, (cell, cellNumber) => {
        targetRow.getCell(cellNumber).value = cell.value;
        
        targetRow.getCell(cellNumber).style = cell.style;
      });
      row.commit();
    });//end coping tamplate
    targetWorksheet.columns= sourceWorksheet.columns;
    targetWorksheet.mergeCells('C2', 'F2');
    targetWorksheet.mergeCells('C4', 'L4');
    const rowl = targetWorksheet.lastRow;

    // Set a specific row height
    rowl.height = 60;

    targetWorksheet.getCell(celsemestr).value = semestr;
    targetWorksheet.getCell(celsemestr).alignment = { horizontal: 'right' };
    targetWorksheet.getCell(celsemestr).font = {name:'Arial Cyr',   size: 8, bold: true};
    if (dogovor=='true')
      targetWorksheet.getCell(celdogovor).value = 'контракт';
    else targetWorksheet.getCell(celdogovor).value = 'бюджет';
    targetWorksheet.getCell(celpckname).value = name;
     
    let stryear = `${(lasteduyear - 1)}/${lasteduyear}`;
    targetWorksheet.getCell(celeduyear).value = stryear;
    targetWorksheet.getCell(celeduyear).font ={name:'Arial Cyr',   size: 15, bold: true};
    // content adding 
    for (let i = start; i < count + start; i++) {
      const row = [i + 1 - start, eduload2[i].sub, eduload2[i].groupname,
      eduload2[i].course, eduload2[i].studentnum, eduload2[i].classwork, eduload2[i].lectures,
      eduload2[i].practices, eduload2[i].labs, eduload2[i].consultations, eduload2[i].exams,
      eduload2[i].credits, eduload2[i].courseworks, eduload2[i].diplompractice,
      eduload2[i].edupractice, eduload2[i].statexam, eduload2[i].total];
     
      const newRow1 = targetWorksheet.addRow(row); 
       
      newRow1.style.border= {
        top: {style:'thin'},
        left: {style:'thin'},
        bottom: {style:'thin'},
        right: {style:'thin'}
      }; 
      newRow1.style.font= {
        name: 'Arial Cyr',
        size: 12
        
      };
       
      const newRow2 = targetWorksheet.addRow([]);
      newRow1.commit();
      newRow2.commit();

    }

    const rowValues = [];
    rowValues[6] = `Голова ПЦК ___________ (${eduload2[start].leader})`;
    start += count;
    targetWorksheet.addRow(rowValues);
    
   let lastRow=targetWorksheet.rowCount+3;
   
   let prnt='A1:' + lastcolumn + lastRow;
   
  //for printSetup in inch
  targetWorksheet.pageSetup.margins = {  
   left: 0.55, right: 0.55,
   top: 0.55, bottom:0.55
  
 };
 // Set Print Area for a sheet
 targetWorksheet.pageSetup.printArea = prnt;

  }

}

      
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          //leaderpck_1.xlsx
          res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + "leaderpck_1.xlsx"
          );
          
          return targetWorkbook.xlsx.write(res).then(function () {
            res.status(200).end();
          });
          
  
}
 

function upload_download(req, res) {
  try {
    const {
      lasteduyear,
      dogovor,
      change

    } = req.body;
    if (req.file == undefined && change == true) {
      return res.status(400).send("Please upload an excel file!");
    }
    
    if (!lasteduyear) {
      return res.status(500).send("No lasteduyear");
    }




    obtainEduload(dogovor)
      .then(async(eduload) => {
        if (eduload) {
                  
         copyExcel(eduload,lasteduyear, dogovor, path,res);
      
        }

      });

  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Could not upload the file: " + req.file.originalname,
    });
  }

}

module.exports = {
  upload_download,

};