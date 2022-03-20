const multer = require("multer");

const excelFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml")
  ) {
    cb(null, true);
  } else {
    cb("Будь ласка, завантажуйте на сервер тількі xlsx файл.", false);
  }
};
const wordFilter = (req, file, cb) => {
  if (
   file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    cb(null, true);
  } else {
    cb("Будь ласка, завантажуйте на сервер тількі docx файл.", false);
  }
};

let storagetmp = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/public/assets/uploads/tmp/");
  },
  filename: (req, file, cb) => {
   
    cb(null, `${Date.now()}-bezkoder-${file.originalname}`);
  },
});


let tmpldir=__basedir + "/public/assets/uploads/templates/";
let storagetmpl = multer.diskStorage({
  destination: (req, file, cb) => {
   
    cb(null, tmpldir);
  },
  filename: (req, file, cb) => {
   
    cb(null, `leaderpck_tmpl.xlsx`);
  },
});
let arrtmpldocx=[`orderzop_b_tmpl.docx`,`orderopp_b_tmpl.docx`,`orderzop_c_tmpl.docx`, 
`orderopp_c_tmpl.docx`,`orderpart_tmpl.docx`];


let storagetmpldoc = multer.diskStorage({
  destination: (req, file, cb) => {
   
    cb(null, tmpldir);
  },
  filename: (req, file, cb) => {
   
    let index=req.body.change-1;
    cb(null,  arrtmpldocx[index]);
  },
});


let uploadFileOrdersTml=multer({ storage: storagetmpldoc, fileFilter: wordFilter });
let uploadFileTmp = multer({ storage: storagetmp, fileFilter: excelFilter });
let uploadFileLeaderpckTml = multer({ storage: storagetmpl, fileFilter: excelFilter });


module.exports={uploadFileTmp,uploadFileLeaderpckTml,uploadFileOrdersTml};