var express = require('express');
var router = express.Router();

/* GET subjects listing. */
const subjectsModel = require("../models/subjects");

router.get('/', function (req, res, next) {
    subjectsModel
        .obtain()
        .then(subjects => {
            res.render("subjects", {
                subjects: subjects,
                title: 'База навантаження -> subjects',
            });
        })
        .catch(err => {
            return res.status(500).send("Error get all subjects");
        });

});
router.get('/add', function (req, res, next) {
    subjectsModel
        .obtainPckAbr() 
        .then(pckAbr=>{
            res.render("subjects/add",{ 
                pckAbr:pckAbr,
            title: 'База навантаження -> Додати subjects',
            });
        })
        .catch(err => {
            return res.status(500).send("Error get leader");
        })
});
router.post('/insert', function (req, res, next) {
     
    const {name, fullname, pckid, programs } = req.body;
    if (!name|| !fullname|| !pckid || !programs) {
        return res.status(500).send("No name, fullname, pckid, programs");
    }
     
    subjectsModel
        .insert(name, fullname, pckid, programs)
        .then(() => {
            res.redirect("/subjects");
        })
        .catch(err => {
            return res.status(500).send("Error insert subjects");
        });
});
router.get('/delete/:id', function (req, res, next) {
    subjectsModel
        .delete(req.params.id)
        .then(() => {
            res.redirect("/subjects");
        })
        .catch(err => {
            return res.status(500).send("Error delete");
        });
});
router.get('/edit/:id', function (req, res, next) {
    subjectsModel
        .obtainPckAbr()
        .then(pckAbr=>{
            if(pckAbr){ 
                subjectsModel
                .obtainSubjectsId(req.params.id)
        .then(subjects => {
            if (subjects) {
                res.render("subjects/edit", {
                    subjects: subjects,
                    pckAbr: pckAbr,
                    title: 'База навантаження -> Редагувати subjects',
                });
            } else {
                return res.status(500).send("No exist subjects with the id");
            }
        })
        .catch(err => {
            return res.status(500).send("Error obtain subjects");
        });

        }
        else  return res.status(500).send("No exist pckAbr");
        });
        

});
router.post('/update/', function (req, res, next) {
   
    const { _id,name, fullname, pckid, programs } = req.body;
  
    if (!_id) {
        return res.status(500).send("No  suficient _id");
    }
    if (!fullname) {
        return res.status(500).send("No  suficient fullname");
    }
    if (!pckid) {
        return res.status(500).send("No  suficient pckid");
    }
    if (!programs) {
        return res.status(500).send("No  suficient programs");
    }
     
    subjectsModel
        .update(_id, name, fullname, pckid, programs)
        .then(() => {
            res.redirect("/subjects");
        })
        .catch(err => {
            return res.status(500).send("Error update subjects");
        });
});
module.exports = router;
