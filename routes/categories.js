var express = require('express');
var router = express.Router();

 
const categoriesModel = require("../models/categories");

router.get('/', function (req, res, next) {
    categoriesModel
        .obtain()
        .then(categories => {
            res.render("categories", {
                categories: categories,
                title: 'База навантаження -> categories',
            });
        })
        .catch(err => {
            return res.status(500).send("Error get all categories");
        });

});
router.get('/add', function (req, res, next) {
    res.render("categories/add",{ 
        title: 'База навантаження -> Додати categories',
    });
});
router.post('/insert', function (req, res, next) {
     
    const { name,payment } = req.body;
    if (!name) {
        return res.status(500).send("No  name");
    }
     
    categoriesModel
        .insert(name, payment)
        .then(() => {
            res.redirect("/categories");
        })
        .catch(err => {
            return res.status(500).send("Error insert categories");
        });
});
router.get('/delete/:id', function (req, res, next) {
    categoriesModel
        .delete(req.params.id)
        .then(() => {
            res.redirect("/categories");
        })
        .catch(err => {
            return res.status(500).send("Error delete");
        });
});
router.get('/edit/:id', function (req, res, next) {
    categoriesModel
        .obtaincategoriesId(req.params.id)
        .then(categories => {
            if (categories) {
                res.render("categories/edit", {
                    categories: categories,
                    title: 'База навантаження -> Редагувати categories',
                });
            } else {
                return res.status(500).send("No exist categories with the id");
            }
        })
        .catch(err => {
            return res.status(500).send("Error obtain categories");
        });
});
router.post('/update/', function (req, res, next) {
  
    const { _id, name, payment } = req.body;
   
    if (!_id) {
        return res.status(500).send("No  suficient _id");
    }
    if (!name) {
        return res.status(500).send("No  suficient name");
    }
    
    categoriesModel
        .update(_id, name, payment)
        .then(() => {
            res.redirect("/categories");
        })
        .catch(err => {
            return res.status(500).send("Error update categories");
        });
});
module.exports = router;
