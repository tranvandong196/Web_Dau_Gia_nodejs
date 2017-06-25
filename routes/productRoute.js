var express = require('express');
var product = require('../models/product');
var moment = require('moment');
var productRoute = express.Router();
var category = require('../models/category');
var restrict = require('../middle-wares/restrict');
var multer  = require('multer');
var fs = require('fs');
var thumb = require('node-thumbnail').thumb;

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
    var indexs = [];
    fs.readdir('./public/images/' + req.params.id, (err, files) => {
        for(var i = 1; i < files.length; i++)
        {
            var temp = {index: i,};
            indexs.push(temp);
        }
    });
    product.loadDetail(req.params.id)
    .then(function(pro) {
        var indexs = [];
        fs.readdir('./public/images/' + req.params.id, (err, files) => {
            for(var i = 1; i < files.length; i++)
            {
                var temp = {
                    stt: i,
                };
                indexs.push(temp);
            }
            var user = res.locals.layoutModels.curUser;
            var score = 0;
            if(user.score)
                score = user.score;
            var x = parseFloat(0.8);
            console.log(indexs[0].stt);
            if (pro) {
                res.render('product/detail', {
                    layoutModels: res.locals.layoutModels,
                    product: pro,
                    isPermit: score > x,
                    indexs: indexs,
                    proID: req.params.id,
                });
            } else {
                res.redirect('/home');
            }
        });
    });
});

productRoute.get('/add', restrict, function(req, res) {
    //TODO
    category.loadAll().then(function(rows){
        var vm = {
            layoutModels: res.locals.layoutModels,
            categories: rows,
        };
        res.render('product/add', vm);
        });
    });

productRoute.post('/add/:userID', function(req, res) {

    var dir = './public/images';
    if(!fs.existsSync(dir + '/temp'))
        fs.mkdirSync(dir + '/temp');
    var storage = multer.diskStorage({
        destination: function(req,file,cb){
            cb(null, dir + '/temp')
        },
        filename: function(req,file,cb){
            cb(null, file.originalname)
        }
    });
    var files;
    var dest;
    var upload = multer({storage: storage}).array('images');
    upload(req,res,function(err) {

        category.findIdByName(req.body.catName).then(function(row){
            var catID = row.CatID;
            files = req.files;
            var id = req.params.userID;
            var now = new Date(Date.now()).toLocaleString();
            now = moment().format('YYYY-MM-DD HH:mm:ss');
            var timeDown = moment(req.body.timeDown, 'D/M/YYYY').format('YYYY-MM-DD HH:mm:ss');
            var entity = {
                proName: req.body.proName,
                userID: id,
                tinyDes: req.body.tinyDes,
                fullDes: req.body.fullDes,
                price: req.body.price,
                priceToBuy: req.body.priceToBuy,
                catID: catID,
                quantity: req.body.quantity,
                timeUp: now,
                timeDown: timeDown,
                handleID: 0,
                deltaPrice: req.body.deltaPrice,
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
                {
                    dest = dir + '/' + insertId;
                    if(!fs.existsSync(dest))
                        fs.mkdirSync(dest);
                    var size = files.length;
                    if(size > 3)
                        size = 3;
                    for(var i = 1; i <= size; i++)
                    {
                        //tạo file hình rỗng để chép sang
                        fs.closeSync(fs.openSync(dest + '/' + i + '.jpg', 'w'));

                        //copy hình sang thư mục đích
                        var stream = fs.createWriteStream(dest + '/' + i + '.jpg');
                        if(i === 1)
                        {
                            fs.createReadStream(dir + '/temp/' + files[i - 1].originalname)
                            .pipe(stream).on('finish', function () {
                                //tạo thumbnail.jpg
                                 thumb({
                                          source: dest + '/1.jpg',
                                          destination: dest,
                                          width: 150,
                                        }, function(files, err, stdout, stderr) {
                                          console.log('Created thumb images!');
                                    });
                            });
                        }
                        else
                        {
                            fs.createReadStream(dir + '/temp/' + files[i - 1].originalname)
                            .pipe(stream).on('finish', function () {
                            });
                        }
                    }
       
                    for(var i = 1; i <= files.length; i++)
                    {
                        //xóa file hình đã lưu tạm
                        fs.unlinkSync(dir + '/temp/' + files[i - 1].originalname);
                    }          
                    res.render('product/add', {
                        layoutModels: res.locals.layoutModels,
                        showMsg: true,
                        error: false,
                        msg: 'Thêm thành công.'
                    });     
                }
            });
        });
    });
});

productRoute.post('/search', function(req, res) {
    var text = req.body.search;
    var entity ={
     search: text
 };
 var result;
 var products;
 var name = text;

 product.findbyName(entity).then(function(rows){

    if(rows.length === 0)
    {
        product.findbyCat(entity)
        .then(function(kq) {
            var rec_per_page = 4;
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
                    catId: kq[0].CatID,
                    name : name,
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
    if(rows.length != 0)
    {
         res.render('product/search', {
            layoutModels: res.locals.layoutModels,
            name:name,
            result: rows,
        });
    }
    });
});


productRoute.post('/sort', function(req, res) {
    var text = req.body.search;
    var opt = req.body.option;
    var entity ={
     search: text
 };
     var result;
     var products;
    var name = text;
    product.findbyName(entity).then(function(rows){

    if(rows.length === 0)
    {
        product.findbyCat(entity)
        .then(function(kq) {
            var rec_per_page = 4;
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

                for(var i = 0;i <data.list.length - 1;i++)
                {
                    for(var j=i+1; j<data.list.length;j++)
                    {
                        if(opt == 1)
                        {
                         if(data.list[i].Price > data.list[j].Price)
                         {
                            var temp = data.list[i];
                            data.list[i] = data.list[j];
                            data.list[j] = temp;
                        }
                    }
                    if(opt == 2)
                    {
                        if(data.list[i].DeltaPrice > data.list[j].DeltaPrice)
                        {
                            var temp = data.list[i];
                            data.list[i] = data.list[j];
                            data.list[j] = temp;
                        }
                    }
                }
            }
            res.render('product/byCat', {
                layoutModels: res.locals.layoutModels,
                products: data.list,
                isEmpty: data.total === 0,
                catId: req.params.id,
                name:name,
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
            res.render('product/sort', {
                layoutModels: res.locals.layoutModels,
                isEmpty: true,
            });
        }

    });
    }
    if(rows.length > 0)
    {
        for(var i = 0;i <rows.length - 1;i++)
        {
            for(var j=i+1; j<rows.length;j++)
            {
                if(opt == 1)
                {
                    if(rows[i].Price > rows[j].Price)
                    {
                        var temp = rows[i];
                        rows[i] = rows[j];
                        rows[j] = temp;
                    }
                }
                
                if(opt == 2)
                {
                    if(rows[i].DeltaPrice > rows[j].DeltaPrice)
                    {
                        var temp = rows[i];
                        rows[i] = rows[j];
                        rows[j] = temp;
                    }
                }
            }
        }
        res.render('product/sort', {
            layoutModels: res.locals.layoutModels,
            name:name,
            result: rows,
        });
    }


});
});

module.exports = productRoute;