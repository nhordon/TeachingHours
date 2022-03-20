var express = require('express');
var router = express.Router();

/* GET leaderpck_navt listing. */
const leaderpck_navtModel = require("../models/leaderpck_navt");

const uploadFileLeaderpckTml = require("../middlewares/upload");


router.get('/', (req,res,next) => {
   
                    res.render("leaderpck_navt", {
       
                        title: 'База навантаження -> leaderpck_navtModel',
                       
                    });
                });

 
  router.post("/upload",
  
  uploadFileLeaderpckTml['uploadFileLeaderpckTml'].single("file"),
    leaderpck_navtModel.upload_download );//,upload_planModel.delFile);
 
 
module.exports = router;

