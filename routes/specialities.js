var express = require('express');
var router = express.Router();

/* GET specialities listing. */
const specialitiesModel = require("../models/specialities");

router.get('/', function (req, res, next) {
    specialitiesModel
        .obtain()
        .then(specialities => {
            res.render("specialities", {
                specialities: specialities,
                title: 'База навантаження -> specialities',
            });
        })
        .catch(err => {
            return res.status(500).send("Error get all specialities");
        });

});
router.get('/add', function (req, res, next) {
    res.render("specialities/add",{ 
        title: 'База навантаження -> Додати specialities',
    });
});
router.post('/insert', function (req, res, next) {
    
    const { number, abr,name } = req.body;
    if (!number || !abr || !name) {
        return res.status(500).send("No number or abr or name");
    }
   
    specialitiesModel
        .insert(number, abr,name)
        .then(idSpecialitiesInsert => {
            res.redirect("/specialities");
        })
        .catch(err => {
            return res.status(500).send("Error insert specialities");
        });
});
router.get('/delete/:id', function (req, res, next) {
    specialitiesModel
        .delete(req.params.id)
        .then(() => {
            res.redirect("/specialities");
        })
        .catch(err => {
            return res.status(500).send("Error delete");
        });
});
router.get('/edit/:id', function (req, res, next) {
    specialitiesModel
        .obtainSpecialitiesId(req.params.id)
        .then(specialities => {
            if (specialities) {
                res.render("specialities/edit", {
                    specialities: specialities,
                    title: 'База навантаження -> Редагувати specialities',
                });
            } else {
                return res.status(500).send("No exist specialities with the id");
            }
        })
        .catch(err => {
            return res.status(500).send("Error obtain specialities");
        });
});
router.post('/update/', function (req, res, next) {
    
    const { _id, number, abr,name } = req.body;
    
    if (!_id) {
        return res.status(500).send("No  suficient _id");
    }
    if (!number) {
        return res.status(500).send("No  suficient number");
    }
    
    specialitiesModel
        .update(_id, number, abr, name)
        .then(() => {
            res.redirect("/specialities");
        })
        .catch(err => {
            return res.status(500).send("Error update specialities");
        });
});
module.exports = router;
