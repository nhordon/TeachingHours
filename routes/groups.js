var express = require('express');
var router = express.Router();

 
const groupsModel = require("../models/groups");

router.get('/', function (req, res, next) {
    groupsModel
        .obtain()
        .then(groups => {
            res.render("groups", {
                groups: groups,
                title: 'База навантаження -> groups',
            });
        })
        .catch(err => {
            return res.status(500).send("Error get all groups");
        });

});
router.get('/add', function (req, res, next) {
    groupsModel
        .obtainSpecAbr() 
        .then(specAbr=>{
            res.render("groups/add",{ 
            specAbr:specAbr,
            title: 'База навантаження -> Додати groups',
            });
        })
        .catch(err => {
            return res.status(500).send("Error get specAbr");
        })
});
router.post('/insert', function (req, res, next) {
    
    const {name, course,specid,dogovor, studentsdogovor,studentsbudget } = req.body;
    if (!name|| !course|| !specid|| !dogovor|| !studentsdogovor|| 
        !studentsbudget) {
        return res.status(500).send("No name, course,specid,dogovor, studentsdogovor,studentsbudget");
    }
     
    groupsModel
        .insert(name, course,specid,dogovor, studentsdogovor,studentsbudget)
        .then(idGroupsInsert => {
            res.redirect("/groups");
        })
        .catch(err => {
            return res.status(500).send("Error insert groups");
        });
});
router.get('/delete/:id', function (req, res, next) {
    groupsModel
        .delete(req.params.id)
        .then(() => {
            res.redirect("/groups");
        })
        .catch(err => {
            return res.status(500).send("Error delete");
        });
});
router.get('/edit/:id', function (req, res, next) {
    groupsModel
        .obtainSpecAbr()
        .then(specAbr=>{
            if(specAbr){ 
                groupsModel
                .obtainGroupsId(req.params.id)
        .then(groups => {
            if (groups) {
                res.render("groups/edit", {
                    groups: groups,
                    specAbr: specAbr,
                    title: 'База навантаження -> Редагувати groups',
                });
            } else {
                return res.status(500).send("No exist groups with the id");
            }
        })
        .catch(err => {
            return res.status(500).send("Error obtain groups");
        });

        }
        else  return res.status(500).send("No exist specAbr");
        });
        

});
router.post('/update/', function (req, res, next) {
     
    const { _id, name, course,specid,dogovor, studentsdogovor,studentsbudget } = req.body;
   
    if (!_id) {
        return res.status(500).send("No  suficient _id");
    }
    if (!name) {
        return res.status(500).send("No  suficient name");
    }
     
    groupsModel
        .update(_id, name, course,specid,dogovor, studentsdogovor,studentsbudget)
        .then(() => {
            res.redirect("/groups");
        })
        .catch(err => {
            return res.status(500).send("Error update groups");
        });
});
module.exports = router;
