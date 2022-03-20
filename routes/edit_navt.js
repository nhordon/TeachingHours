var express = require('express');
var router = express.Router();

 
const edit_navtModel = require("../models/edit_navt");

router.get('/', function (req, res, next) {

    edit_navtModel
        .obtain()
        .then(eduload => {
            edit_navtModel
        .obtainGroupNameHours() 
        .then(groupNameHours=>{
                res.render("edit_navt", {
                    eduload: eduload,
                    groupNameHours:groupNameHours,
                    title: 'База навантаження -> eduload',
                });

            })
            .catch(err => {
               return res.status(500).send("Error get all groupName");
            }); //  }
          
        })
        .catch(err => {
           return res.status(500).send("Error get all eduload");
        });

});
router.get('/add', function (req, res, next) {
    edit_navtModel
        .obtainGroupName() 
        .then(groupName=>{
            edit_navtModel
            .obtainSubjectName() 
        .then(subjectName=>{

            edit_navtModel
            .obtainTeacherName() 
        .then(teacherName=>{

               
                
            res.render("edit_navt/add",{ 
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
    
    edit_navtModel
        .insert(groupid, subjectid, teacherid, semestr, lectures, practices, labs, 
            consultations, exams, credits, courseworks, edupractice, diplompractice,
                statexam, assigned )
        .then(idGroupsInsert=> {
            res.redirect("/edit_navt");
        })
        .catch(err => {
            return res.status(500).send("Error insert new eduload");
        });
});
router.get('/delete/:id', function (req, res, next) {
    edit_navtModel
        .delete(req.params.id)
        .then(() => {
            res.redirect("/edit_navt");
        })
        .catch(err => {
            return res.status(500).send("Error delete");
        });
});
router.get('/edit/:id', function (req, res, next) {
    edit_navtModel
        .obtainGroupName()
        .then(groupName=>{

            edit_navtModel
            .obtainSubjectName()
            .then(subjectName=>{

                edit_navtModel
                .obtainTeacherName()
                .then(teacherName=>{
    
                    edit_navtModel
                    .obtainEduloadId(req.params.id)
            .then(eduload => {
                if (eduload) {
                    res.render("edit_navt/edit", {
                        eduload: eduload,
                        groupName: groupName,
                        teacherName:teacherName,
                        subjectName:subjectName,
                        title: 'База навантаження -> Редагувати eduload',
                    });
                } else {
                    return res.status(500).send("No exist eduload with the id");
                }
            })
            .catch(err => {
                return res.status(500).send("Error obtain eduload");
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
     
    edit_navtModel
        .update(_id, groupid, subjectid, teacherid, semestr, lectures, practices, labs, 
            consultations, exams, credits, courseworks, edupractice, diplompractice,
                statexam, assigned)
        .then(() => {
            res.redirect("/edit_navt");
        })
        .catch(err => {
            return res.status(500).send("Error update eduload");
        });
});
module.exports = router;
