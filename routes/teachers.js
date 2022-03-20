var express = require('express');
var router = express.Router();

/* GET teachers listing. */
const teachersModel = require("../models/teachers");
 
router.get('/', function (req, res, next) {

            teachersModel
            .obtain()
            .then(teachers => {
              
                res.render("teachers", {
                    teachers: teachers,
                   
                    title: 'База навантаження -> teachers',
                });
            })
            .catch(err => {
                return res.status(500).send("Error get all teachers");
            });
           
       

    

});
router.get('/add', function (req, res, next) {

    teachersModel
    .obtainCategoriesName()
    .then(categoryName=>{
        teachersModel
        .obtainPckAbr()
        .then(pckAbr=>{
           
               
                res.render("teachers/add", {
                   
                    categoryName:categoryName,
                    pckAbr:pckAbr,
                    title: 'База навантаження -> Додати teachers',
                });
           
           
        })
        .catch(err => {
            return res.status(500).send("Error get pckAbr");
        });
       
    })
    .catch(err => {
        return res.status(500).send("Error get categoriesName");
    });



});
router.post('/insert', function (req, res, next) {
    
    const {  name, sovmest, norma, sverh, fact, position, categoryid,pckid } = req.body;
    if (!name || !norma) {
        return res.status(500).send("No norma  or name");
    }
     
    teachersModel
        .insert( name, sovmest, norma, sverh, fact,  position, pckid, categoryid )
        .then(() => {
            res.redirect("/teachers");
        })
        .catch(err => {
            return res.status(500).send("Error insert teachers");
        });
});
router.get('/delete/:id', function (req, res, next) {
    teachersModel
        .delete(req.params.id)
        .then(() => {
            res.redirect("/teachers");
        })
        .catch(err => {
            return res.status(500).send("Error delete");
        });
});
router.get('/edit/:id', function (req, res, next) {
    teachersModel
    .obtainCategoriesName()
    .then(categoryName=>{
        teachersModel
        .obtainPckAbr()
        .then(pckAbr=>{
    teachersModel
        .obtainTeachersId(req.params.id)
        .then(teachers => {
            if (teachers) {
                res.render("teachers/edit", {
                    teachers: teachers,
                    categoryName:categoryName,
                    pckAbr:pckAbr,
                    title: 'База навантаження -> Редагувати teachers',
                });
            } else {
                return res.status(500).send("No exist teachers with the id");
            }
        })
        .catch(err => {
            return res.status(500).send("Error obtain teachers");
        });
    })
    .catch(err => {
        return res.status(500).send("Error get pckAbr");
    });
   
})
.catch(err => {
    return res.status(500).send("Error get categoriesName");
});
});
router.post('/update/', function (req, res, next) {
    
    const { _id,  name, sovmest, norma, sverh, fact,  position, categoryid,pckid  } = req.body;
    
    if (!_id|| !name) {
        return res.status(500).send("No  suficient _id or name");
    }
    
     
    teachersModel
        .update(_id, name, sovmest, norma, sverh, fact,  position, pckid, categoryid )
        .then(() => {
            res.redirect("/teachers");
        })
        .catch(err => {
            return res.status(500).send("Error update teachers");
        });
});
module.exports = router;
