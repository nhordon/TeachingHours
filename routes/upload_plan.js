var express = require('express');
var router = express.Router();

/* GET upload_plan listing. */
const upload_planModel = require("../models/upload_plan");

const uploadFileTmp = require("../middlewares/upload");

 
router.get('/', (req,res,next) => {
    upload_planModel
    .obtainGroupCourse()
    .then(groupCourse => {
        if(groupCourse){
            upload_planModel
            .obtainPlanid()
            .then(Planid => {
                if(Planid){
                    res.render("upload_plan", {
       
                        title: 'База навантаження -> upload_plan',
                        groupCourse : groupCourse,
                        Planid : Planid,
                    });
                }
                else {
                    return res.status(500).send("No Planid");
                }
            })
            .catch(err => {
                return res.status(500).send("Error obtain Planid");
            });
        }
        else  return res.status(500).send("No exist groupCourse");
    }).
    catch(err => {
        return res.status(500).send("Error obtain groupCourse");
    });
 
});

    
  router.post("/upload", uploadFileTmp['uploadFileTmp'].single("file"), upload_planModel.upload);//,upload_planModel.delFile);
  
  
  router.get('/delete/:id', function (req, res, next) {
    upload_planModel
        .deletePlanind(req.params.id)
        .then(() => {
            res.redirect("/upload_plan");
        })
        .catch(err => {
            return res.status(500).send("Error delete");
        });
});
module.exports = router;

