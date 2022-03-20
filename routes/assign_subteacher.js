var express = require('express');
var router = express.Router();


const assign_subteacherModel = require("../models/assign_subteacher");

router.get('/', function (req, res, next) {
    assign_subteacherModel
    .obtainSubjectsPckGroups()
    .then(subjectpckName=>{
               
            
        res.render("assign_subteacher",{ 
           
            subjectpckName:subjectpckName,
           
        title: 'Розподіл викладачей за предметами та групами',
        });
    })
    
    .catch(err => {
        return res.status(500).send("Error get SubjectsPckGroups");
    })

});
 
router.post('/add', function (req, res, next) {

    let {pckabr, subjectid, groupid, semestr } = req.body;
      
    if (!groupid|| !subjectid|| !semestr||!pckabr) {
        return res.status(500).send("No groupid,subjectid,semestr, pckabr");
    }
    assign_subteacherModel
        .obtainEduloadTeacher(subjectid, groupid, semestr) 
        .then(eduloadTeacher=>{   
            if (eduloadTeacher.length==0) {
                return res.status(500).send("eduloadTeacher.length==0. Перевірте номер семестру");
            }     

            assign_subteacherModel
            .obtainTeacherPck() 
        .then(teacherName=>{             
                
            res.render("assign_subteacher/add",{ 
                pckabr:pckabr,
                eduloadTeacher:eduloadTeacher,
                teacherName:teacherName,
            title: 'Розподіл викладачей за предметами та групами',
            });
        })
        .catch(err => {
            return res.status(500).send("Error get teacherName");
        })
           
       
        
        })
        .catch(err => {
            return res.status(500).send("Error get eduloadTeacher");
        })
});

router.post('/insert', function (req, res, next) {
   
    let {eduloadid, teacherid, lectures_teach, practices_teach, labs_teach, 
        consultations_teach, exams_teach, credits_teach, courseworks_teach, 
        edupractice_teach, diplompractice_teach, statexam_teach, distribute }
         = req.body;
        
    if (!eduloadid|| !teacherid ) {
        return res.status(500).send("No eduloadid,teacherid");
    }
    
    assign_subteacherModel
        .insertupdate(eduloadid, teacherid, lectures_teach, practices_teach, labs_teach, 
            consultations_teach, exams_teach, credits_teach, courseworks_teach, 
            edupractice_teach, diplompractice_teach, statexam_teach  )
        .then(()=> {
            if(distribute=='true'){
                assign_subteacherModel
                .updateeduload(eduloadid)
               .then(()=>{
                    res.redirect("/assign_subteacher");

               })
                .catch(err => {
                    return res.status(500).send("Error update eduload");
                });

            }
            else res.redirect("/assign_subteacher");
        })
        .catch(err => {
            return res.status(500).send("Error insert_update  teachload");
        });
});
router.post('/delete', function (req, res, next) {
    let {pckabr,subjectname, groupname, semestr, teacherid,  eduloadid } = req.body;
    if (!teacherid|| !eduloadid) {
        return res.status(500).send("No teacherid,eduloadid");
    }
    assign_subteacherModel
        .delete(eduloadid,teacherid)
        .then(() => {
            res.redirect("/assign_subteacher");
        })
        .catch(err => {
            return res.status(500).send("Error delete");
        });
});

module.exports = router;
