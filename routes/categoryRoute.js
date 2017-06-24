var express = require('express');
var category = require('../models/category');
var product = require('../models/product');
var restrict = require('../middle-wares/restrict');
var Q = require('q');

var categoryRoute = express.Router();

categoryRoute.get('/edit/:id', restrict, function(req, res) {
    var id = req.params.id;
    category.load(id).then(function(category){
        res.render('category/edit', {
            layoutModels: res.locals.layoutModels,
            category: category,
            showMsg: false,
            error: false,
            msg: '',
        });
    });
});

categoryRoute.post('/edit', restrict, function(req, res) {
    var name = req.body.catName;
    var id = req.body.catID;
    var entity = {
        catID: id,
        catName: name,
    };
    Q.all([
        category.update(entity)
    ]).spread(function(changedRows){
        res.redirect('/account/manageCategories');
    });
});

categoryRoute.get('/add', restrict, function(req, res) {
    res.render('category/add', {
        layoutModels: res.locals.layoutModels,
        showMsg: false,
        error: false,
        msg: '',
    });
});

categoryRoute.post('/add', restrict, function(req, res) {
    var name = req.body.catName;
    var entity = {
        catName: name,
    };
    Q.all([
        category.insert(entity)
    ]).spread(function(insertId){
        res.redirect('/account/manageCategories');
    });
});

categoryRoute.post('/delete', restrict, function(req, res) {
    var id = req.body.catID;
    product.deleteByCat(id);
    category.delete(id);
});

module.exports = categoryRoute;