var express = require('express');
var router = express.Router();

/* GET leaderpck_navt listing. */
const report_navtModel = require("../models/report_navt");

const uploadFileOrdersTml = require("../middlewares/upload");

 
router.get('/', (req,res,next) => {
  report_navtModel
   .namesTamplates().then(namesTampl=>{
    
    res.render("report_navt", {
      namesTampl: namesTampl,
        title: 'База навантаження -> report_navt',
       
    });
   })
                  
                });

              
               
  router.post("/upload", 
   (req,res)=>{
     let numbutton=req.body.btnOrderSubmit;
     let numbuttonFinish=req.body.btnOrderSubmitFinish;
      
     if(numbutton!=undefined)
          report_navtModel.processReport(res, numbutton,false);
     if(numbuttonFinish!=undefined)
          report_navtModel.processReport(res, numbuttonFinish, true);
     
   }
  
   );
   
   router.post("/upload_tampl",   uploadFileOrdersTml['uploadFileOrdersTml'].single("file"),
     (req, res)=>{
      res.redirect("/report_navt");
     }  
   
   
   );
   
   
module.exports = router;

