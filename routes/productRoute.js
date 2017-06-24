var express = require('express');
var product = require('../models/product');
var moment = require('moment');
var productRoute = express.Router();
var restrict = require('../middle-wares/restrict');
var multer  = require('multer');
var fs = require('fs');
productRoute.get('/byCat/:id', function(req, res) {

    // product.loadAllByCat(req.params.id)
    //     .then(function(list) {
    //         res.render('product/byCat', {
    //             layoutModels: res.locals.layoutModels,
    //             products: list,
    //             isEmpty: list.length === 0,
    //             catId: req.params.id
    //         });
    //     });

    var rec_per_page = 6;
    var curPage = req.query.page ? req.query.page : 1;
    var offset = (curPage - 1) * rec_per_page;

    product.loadPageByCat(req.params.id, rec_per_page, offset)
    .then(function(data) {

        var number_of_pages = data.total / rec_per_page;
        if (data.total % rec_per_page > 0) {
            number_of_pages++;
        }

        var pages = [];
        for (var i = 1; i <= number_of_pages; i++) {
            pages.push({
                pageValue: i,
                isActive: i === +curPage
            });
        }

        res.render('product/byCat', {
            layoutModels: res.locals.layoutModels,
            products: data.list,
            isEmpty: data.total === 0,
            catId: req.params.id,

            pages: pages,
            curPage: curPage,
            prevPage: curPage - 1,
            nextPage: curPage + 1,
            showPrevPage: curPage > 1,
            showNextPage: curPage < number_of_pages - 1,
        });
    });
});

productRoute.get('/detail/:id', function(req, res) {
    product.loadDetail(req.params.id)
    .then(function(pro) {
        if (pro) {
            res.render('product/detail', {
                layoutModels: res.locals.layoutModels,
                product: pro,
            });
        } else {
            res.redirect('/home');
        }
    });
});

productRoute.get('/add', restrict, function(req, res) {
    //TODO
    var vm = {
        layoutModels: res.locals.layoutModels,
    };
    res.render('product/add', vm);
});

productRoute.post('/add/:userID', function(req, res) {
    console.log(req.file)
    var id = req.params.userID;
    var now = new Date(Date.now()).toLocaleString();
    now = moment().format('YYYY-MM-DD HH:mm:ss');
    var entity = {
        proName: req.body.proName,
        userID: id,
        tinyDes: req.body.tinyDes,
        fullDes: req.body.fullDes,
        price: req.body.price,
        priceToBuy: req.body.priceToBuy,
        catID: req.body.catID,
        quantity: req.body.quantity,
        timeUp: now,
        timeDown: now,
        handleID: 1,
        deltaPrice: 0,
    };
    product.insert(entity).then(function(insertId) {
        if(insertId === -1)
        {
            res.render('product/add', {
                layoutModels: res.locals.layoutModels,
                showMsg: true,
                error: true,
                msg: 'Thêm thất bại.'
            });
        }
        else
                var dir = './public/images/' + insertId;

                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }
                else
                    console.log("Folder is exists: ./public/images/0")

                var storage = multer.diskStorage({
                    destination: function(req,file,cb){
                        cb(null,dir)
                    },
                    filename: function(req,file,cb){
                        cb(null,file.originalname)
                    }
                })
                var upload = multer({storage: storage})
                console.log(req.file)
                upload.single(req.file)
                //    upload(req, res, function (err) {
                //     if (err) {
                //       console.log("Loi upload file")
                //       //return
                //     }
                //     else
                //         console.log(req.file)
                //   })
                   console.log("???")


            res.render('product/add', {
                layoutModels: res.locals.layoutModels,
                showMsg: true,
                error: false,
                msg: 'Thêm thành công.'
            });
    });

});

productRoute.post('/search', function(req, res) {
    var text = req.body.search;
    var entity ={
       search: text
   };
   product.findbyName(entity).then(function(rows){

    if(rows.length === 0)
    {
        product.findbyCat(entity)
        .then(function(kq) {
            var rec_per_page = 6;
            var curPage = req.query.page ? req.query.page : 1;
            var offset = (curPage - 1) * rec_per_page;

            if(kq.length)
            {
               product.loadPageByCat(kq[0].CatID, rec_per_page, offset)
               .then(function(data) {

                var number_of_pages = data.total / rec_per_page;
                if (data.total % rec_per_page > 0) {
                    number_of_pages++;
                }

                var pages = [];
                for (var i = 1; i <= number_of_pages; i++) {
                    pages.push({
                        pageValue: i,
                        isActive: i === +curPage
                    });
                }

                res.render('product/byCat', {
                    layoutModels: res.locals.layoutModels,
                    products: data.list,
                    isEmpty: data.total === 0,
                    catId: req.params.id,

                    pages: pages,
                    curPage: curPage,
                    prevPage: curPage - 1,
                    nextPage: curPage + 1,
                    showPrevPage: curPage > 1,
                    showNextPage: curPage < number_of_pages - 1,
                });
            });
           }

           else {
                res.render('product/search', {
                    layoutModels: res.locals.layoutModels,
                    isEmpty: true,
                });
            }

    });
    }
    if(rows.length !== 0)
    {
        var rec_per_page = 6;
        var curPage = req.query.page ? req.query.page : 1;
        var offset = (curPage - 1) * rec_per_page;

       product.loadPageByCat(kq[0].CatID, rec_per_page, offset)
       .then(function(data) {

        var number_of_pages = data.total / rec_per_page;
        if (data.total % rec_per_page > 0) {
            number_of_pages++;
        }

        var pages = [];
        for (var i = 1; i <= number_of_pages; i++) {
            pages.push({
                pageValue: i,
                isActive: i === +curPage
            });
        }

        res.render('product/byCat', {
            layoutModels: res.locals.layoutModels,
            products: data.list,
            isEmpty: data.total === 0,
            catId: req.params.id,

            pages: pages,
            curPage: curPage,
            prevPage: curPage - 1,
            nextPage: curPage + 1,
            showPrevPage: curPage > 1,
            showNextPage: curPage < number_of_pages - 1,
        });
        });
   }


});
});

module.exports = productRoute;