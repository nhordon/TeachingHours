var express = require('express');
var router = express.Router();

/* GET pck listing. */
const pckModel = require("../models/pck");

router.get('/', function (req, res, next) {
    pckModel
        .obtain()
        .then(pck => {
            res.render("pck", {
                pck: pck,
                title: 'База навантаження -> pck',
            });
        })
        .catch(err => {
            return res.status(500).send("Error get all pck");
        });

});
router.get('/add', function (req, res, next) {
    pckModel
        .obtainLeader() 
        .then(leader=>{
            res.render("pck/add",{ 
            leader:leader,
            title: 'База навантаження -> Додати pck',
            });
        })
        .catch(err => {
            return res.status(500).send("Error get leader");
        })
});
router.post('/insert', function (req, res, next) {
     
    const {abr, name, leaderid } = req.body;
    if (!name|| !abr|| !leaderid) {
        return res.status(500).send("No name, abr, leaderid");
    }
    
    pckModel
        .insert(abr, name, leaderid)
        .then(idGroupsInsert => {
            res.redirect("/pck");
        })
        .catch(err => {
            return res.status(500).send("Error insert pck");
        });
});
router.get('/delete/:id', function (req, res, next) {
    pckModel
        .delete(req.params.id)
        .then(() => {
            res.redirect("/pck");
        })
        .catch(err => {
            return res.status(500).send("Error delete");
        });
});
router.get('/edit/:id', function (req, res, next) {
    pckModel
        .obtainLeader()
        .then(leader=>{
            if(leader){ 
                pckModel
                .obtainPckId(req.params.id)
                .then(pck => {
                    if (pck) {
                         res.render("pck/edit", {
                            pck: pck,
                            leader: leader,
                            title: 'База навантаження -> Редагувати pck',
                });
            } else {
                return res.status(500).send("No exist pck with the id");
            }
        })
        .catch(err => {
            return res.status(500).send("Error obtain pck");
        });

        }
        else  return res.status(500).send("No exist specAbr");
        });
        

});
router.post('/update/', function (req, res, next) {
    
    const { _id,abr, name, leaderid } = req.body;
    
    if (!_id) {
        return res.status(500).send("No  suficient _id");
    }
    if (!name) {
        return res.status(500).send("No  suficient name");
    }
    if (!leaderid) {
        return res.status(500).send("No  suficient leaderid");
    }
     
    pckModel
        .update(_id, abr, name, leaderid)
        .then(() => {
            res.redirect("/pck");
        })
        .catch(err => {
            return res.status(500).send("Error update pck");
        });
});
module.exports = router;
