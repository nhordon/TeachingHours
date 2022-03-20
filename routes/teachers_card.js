var express = require('express');
var router = express.Router();

/* GET leaderpck_navt listing. */
const teachers_cardModel = require("../models/teachers_card");

 


router.get('/', (req,res,next) => {
   
                    res.render("teachers_card", {
       
                        title: 'База навантаження -> teachers_card',
                       
                    });
                });


  router.post("/upload",
  
  (req,res)=>{
    let numbutton=req.body.btnEduloadSubmit;
    
    if(numbutton!=undefined)
    teachers_cardModel.processTeachCard(res, numbutton);
   
  }
     
    
    );
module.exports = router;

