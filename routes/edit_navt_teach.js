var express = require('express');
var router = express.Router();

 
const edit_navt_teachModel = require("../models/edit_navt_teach");

router.get('/', function (req, res, next) {

    edit_navt_teachModel
        .obtain()
        .then(eduload => {
            edit_navt_teachModel
        .obtainGroupNameHours() 
        .then(groupNameHours=>{
                res.render("edit_navt_teach", {
                    eduload: eduload,
                    groupNameHours:groupNameHours,
                    title: 'База навантаження -> teachload',
                });

            })
            .catch(err => {
               return res.status(500).send("Error get all groupName");
            }); //  }
          
        })
        .catch(err => {
           return res.status(500).send("Error get all teachload");
        });

});
router.get('/add', function (req, res, next) {
    edit_navt_teachModel
        .obtainGroupName() 
        .then(groupName=>{
            edit_navt_teachModel
            .obtainSubjectName() 
        .then(subjectName=>{

            edit_navt_teachModel
            .obtainTeacherName() 
        .then(teacherName=>{

               
                
            res.render("edit_navt_teach/add",{ 
                groupName:groupName,
                subjectName:subjectName,
                teacherName:teacherName,
            title: 'База навантаження -> Додати teacherName',
            });
        })
        .catch(err => {
            return res.status(500).send("Error get teacherName");
        })
           
        })
        .catch(err => {
            return res.status(500).send("Error get subjectName");
        })
           
        })
        .catch(err => {
            return res.status(500).send("Error get groupName");
        })
});
router.get('/insertfromhours', function (req, res, next) {
   
    edit_navtModel
        .insertfromhours()
        .then(() => {
            res.redirect("/edit_navt");
        })
        .catch(err => {
            return res.status(500).send("Error insert_update eduload from hours");
        });
});

router.get('/insertfromhoursgroup/:groupid', function (req, res, next) {
   
    edit_navtModel
        .insertfromhoursgroup(req.params.groupid)
        .then(() => {
            res.redirect("/edit_navt");
        })
        .catch(err => {
            return res.status(500).send("Error insert_update eduload from hours by group");
        });
});

router.post('/insert', function (req, res, next) {
    
    let {groupid, subjectid, teacherid, semestr, lectures, practices, labs, 
        consultations, exams, credits, courseworks, edupractice, diplompractice,
            statexam,assigned } = req.body;
            if(teacherid==0)
            teacherid=null;
            
    if (!groupid|| !subjectid|| !semestr) {
        return res.status(500).send("No groupid,subjectid,semestr");
    }
    
    edit_navt_teachModel
        .insert(groupid, subjectid, teacherid, semestr, lectures, practices, labs, 
            consultations, exams, credits, courseworks, edupractice, diplompractice,
                statexam, assigned )
        .then(idGroupsInsert=> {
            res.redirect("/edit_navt");
        })
        .catch(err => {
            return res.status(500).send("Error insert new teachload");
        });
});
router.get('/delete/:id', function (req, res, next) {
    edit_navt_teachModel
        .delete(req.params.id)
        .then(() => {
            res.redirect("/edit_navt_teach");
        })
        .catch(err => {
            return res.status(500).send("Error delete");
        });
});
router.get('/edit/:id', function (req, res, next) {
    edit_navt_teachModel
        .obtainGroupName()
        .then(groupName=>{

            edit_navt_teachModel
            .obtainSubjectName()
            .then(subjectName=>{

                edit_navt_teachModel
                .obtainTeacherName()
                .then(teacherName=>{
    
                    edit_navt_teachModel
                    .obtainEduloadId(req.params.id)
            .then(eduload => {
                if (eduload) {
                    res.render("edit_navt_teach/edit", {
                        eduload: eduload,
                        groupName: groupName,
                        teacherName:teacherName,
                        subjectName:subjectName,
                        title: 'База навантаження -> Редагувати teachload',
                    });
                } else {
                    return res.status(500).send("No exist eduload with the id");
                }
            })
            .catch(err => {
                return res.status(500).send("Error obtain teachload");
            }); 
    
                })
                .catch(err => {
                    return res.status(500).send("Error obtain teacherName");
                });

            })
            .catch(err => {
                return res.status(500).send("Error obtain subjectName");
            });
           
         

       
        })
        .catch(err => {
            return res.status(500).send("Error obtain groupName");
        });
        

});
router.post('/update/', function (req, res, next) {
   
    let { _id, groupid, subjectid, teacherid, semestr, lectures, practices, labs, 
        consultations, exams, credits, courseworks, edupractice, diplompractice,
            statexam, assigned } = req.body;
            if(teacherid==0)
            teacherid=null;
    
    if (!_id) {
        return res.status(500).send("No  suficient _id");
    }
    if (!groupid) {
        return res.status(500).send("No  suficient groupid");
    }
    if (!subjectid) {
        return res.status(500).send("No  suficient subjectid");
    }
    if (!semestr) {
        return res.status(500).send("No  suficient semestr");
    }
    
    edit_navt_teachModel
        .update(_id, groupid, subjectid, teacherid, semestr, lectures, practices, labs, 
            consultations, exams, credits, courseworks, edupractice, diplompractice,
                statexam, assigned)
        .then(() => {
            res.redirect("/edit_navt_teach");
        })
        .catch(err => {
            return res.status(500).send("Error update teachload");
        });
});
module.exports = router;
