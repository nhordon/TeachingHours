var express = require('express');
var router = express.Router();

/* GET leaderpck_navt listing. */
const teachers_navtModel = require("../models/teachers_navt");

 


router.get('/', (req,res,next) => {
   
                    res.render("teachers_navt", {
       
                        title: 'База навантаження -> teachers_navt',
                       
                    });
                });


  router.post("/upload",
  
  (req,res)=>{
    let numbutton=req.body.btnEduloadSubmit;
    
    if(numbutton!=undefined)
    teachers_navtModel.processTeachEduload(res, numbutton);
   
  }
   
    
    );
module.exports = router;

