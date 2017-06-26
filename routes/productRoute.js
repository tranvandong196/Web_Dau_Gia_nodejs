var express = require('express');
var product = require('../models/product');
var moment = require('moment');
var productRoute = express.Router();
var category = require('../models/category');
var restrict = require('../middle-wares/restrict');
var multer  = require('multer');
var fs = require('fs');
var thumb = require('node-thumbnail').thumb;
var favorite = require('../models/favorite');

productRoute.get('/byCat/:id', function(req, res) {
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
    var user = res.locals.layoutModels.curUser;
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
            if(user)
            {
                var entity = {
                    proID: req.params.id,
                    userID: user.id,
                };
                favorite.isLoved(entity).then(function(isLoved){
                    for(var i = 1; i < files.length; i++)
                    {
                        var temp = {
                            stt: i,
                        };
                        indexs.push(temp);
                    }
                    var score = user.score;
                    var x = parseFloat(0.8);
                    if (pro) {
                        res.render('product/detail', {
                            layoutModels: res.locals.layoutModels,
                            product: pro,
                            isPermit: score > x,
                            indexs: indexs,
                            proID: req.params.id,
                            isLoved: isLoved,
                        });
                    } else {
                        res.redirect('/home');
                    }
                });
            }
            else
            {
                for(var i = 1; i < files.length; i++)
                {
                    var temp = {
                        stt: i,
                    };
                    indexs.push(temp);
                }
                var score = 0;
                var x = parseFloat(0.8);
                if (pro) {
                    res.render('product/detail', {
                        layoutModels: res.locals.layoutModels,
                        product: pro,
                        isPermit: false,
                        indexs: indexs,
                        proID: req.params.id,
                        isLoved: false,
                    });
                } else {
                    res.redirect('/home');
                }
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

productRoute.get('/addLove/:id', restrict, function(req, res) {
    //TODO
    var id = req.params.id;
    var user = res.locals.layoutModels.curUser;
    var entity = {
        proID: id,
        userID: user.id,
    };
    favorite.insert(entity).then(function(insertId){
        res.redirect('/product/detail/' + id);
    });
});

productRoute.get('/removeLove/:id', restrict, function(req, res) {
    //TODO
    var id = req.params.id;
    var user = res.locals.layoutModels.curUser;
    var entity = {
        proID: id,
        userID: user.id,
    };
    favorite.delete(entity).then(function(affectedRows){
        res.redirect('/product/detail/' + id);
    });
});

productRoute.get('/search/addLove/:id', restrict, function(req, res) {
    //TODO
    var id = req.params.id;
    var user = res.locals.layoutModels.curUser;
    var entity = {
        proID: id,
        userID: user.id,
    };
    favorite.insert(entity).then(function(insertId){
        var rec_per_page = 6;
        var curPage = req.query.page ? req.query.page : 1;
        var offset = (curPage - 1) * rec_per_page;
        console.log('offset: ' + offset);
        var text = req.query.text;
        var findBy = req.query.findBy;
        var arrange = req.query.arrange;

        var entity ={
             text: text,
             findBy: findBy,
             arrange: arrange,
        };
        product.search(entity).then(function(products){
            var list = [];
            for(var i = offset; i < products.length; i++)
            {
                list.push(products[i]);
                if(i === offset + 5)
                {
                    i = products.length;
                }
            }
            var data = {
                total: products.length,
                list: list,
            }
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

            product.loadAllByFavorite(res.locals.layoutModels.curUser.id).then(function(rows){
                var box = [];   
                for (var i = 0; i < data.list.length; i++) {
                    var bool = rows.findIndex(function(element){
                        return element.ProID === data.list[i].ProID;
                    });

                    var isLoved = false;
                    if(bool !== -1)
                    {
                        isLoved = true;
                    }
                    var temp = {
                        product: data.list[i],
                        isLoved: isLoved,
                    }
                    box.push(temp);
                }
                res.render('product/search', {
                    layoutModels: res.locals.layoutModels,
                    box: box,
                    isEmpty: data.total === 0,
                    text: text,
                    findBy: findBy,
                    arrange: arrange,
                    length: products.length,

                    pages: pages,
                    curPage: curPage,
                    prevPage: curPage - 1,
                    nextPage: curPage + 1,
                    showPrevPage: curPage > 1,
                    showNextPage: curPage < number_of_pages - 1,
                });
            });
        });
    });
});


productRoute.get('/search/removeLove/:id', restrict, function(req, res) {
    //TODO
    var id = req.params.id;
    var user = res.locals.layoutModels.curUser;
    var entity = {
        proID: id,
        userID: user.id,
    };
    favorite.delete(entity).then(function(affectedRows){
        var rec_per_page = 6;
        var curPage = req.query.page ? req.query.page : 1;
        var offset = (curPage - 1) * rec_per_page;
        console.log('offset: ' + offset);
        var text = req.query.text;
        var findBy = req.query.findBy;
        var arrange = req.query.arrange;

        var entity ={
             text: text,
             findBy: findBy,
             arrange: arrange,
        };
        product.search(entity).then(function(products){
            var list = [];
            for(var i = offset; i < products.length; i++)
            {
                list.push(products[i]);
                if(i === offset + 5)
                {
                    i = products.length;
                }
            }
            var data = {
                total: products.length,
                list: list,
            }
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

            product.loadAllByFavorite(res.locals.layoutModels.curUser.id).then(function(rows){
                var box = [];   
                for (var i = 0; i < data.list.length; i++) {
                    var bool = rows.findIndex(function(element){
                        return element.ProID === data.list[i].ProID;
                    });

                    var isLoved = false;
                    if(bool !== -1)
                    {
                        isLoved = true;
                    }
                    var temp = {
                        product: data.list[i],
                        isLoved: isLoved,
                    }
                    box.push(temp);
                }
                res.render('product/search', {
                    layoutModels: res.locals.layoutModels,
                    box: box,
                    isEmpty: data.total === 0,
                    text: text,
                    findBy: findBy,
                    arrange: arrange,
                    length: products.length,

                    pages: pages,
                    curPage: curPage,
                    prevPage: curPage - 1,
                    nextPage: curPage + 1,
                    showPrevPage: curPage > 1,
                    showNextPage: curPage < number_of_pages - 1,
                });
            });
        });
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
    var rec_per_page = 6;
    var curPage = 1;
    var offset = 0;
    var text = req.body.search;
    var findBy = req.body.findBy;
    var arrange = req.body.arrange;

    var entity ={
         text: text,
         findBy: findBy,
         arrange: arrange,
    };

    product.search(entity).then(function(products){
        var list = [];
        for(var i = offset; i < products.length; i++)
        {
            list.push(products[i]);
            if(i === offset + 5)
            {
                i = products.length;
            }
        }
        var data = {
            total: products.length,
            list: list,
        }
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
        product.loadAllByFavorite(res.locals.layoutModels.curUser.id).then(function(rows){
            var box = [];   
            for (var i = 0; i < data.list.length; i++) {
                var bool = rows.findIndex(function(element){
                    return element.ProID === data.list[i].ProID;
                });

                var isLoved = false;
                if(bool !== -1)
                {
                    isLoved = true;
                }
                var temp = {
                    product: data.list[i],
                    isLoved: isLoved,
                }
                box.push(temp);
            }
            res.render('product/search', {
                layoutModels: res.locals.layoutModels,
                box: box,
                isEmpty: data.total === 0,
                text: text,
                findBy: findBy,
                arrange: arrange,
                length: products.length,

                pages: pages,
                curPage: curPage,
                prevPage: curPage - 1,
                nextPage: curPage + 1,
                showPrevPage: curPage > 1,
                showNextPage: curPage < number_of_pages - 1,
            });
        });
    });
});

productRoute.get('/search', function(req, res) {
    var rec_per_page = 6;
    var curPage = req.query.page ? req.query.page : 1;
    var offset = (curPage - 1) * rec_per_page;
    console.log('offset: ' + offset);
    var text = req.query.text;
    var findBy = req.query.findBy;
    var arrange = req.query.arrange;

    var entity ={
         text: text,
         findBy: findBy,
         arrange: arrange,
    };
    product.search(entity).then(function(products){
        var list = [];
        for(var i = offset; i < products.length; i++)
        {
            list.push(products[i]);
            if(i === offset + 5)
            {
                i = products.length;
            }
        }
        var data = {
            total: products.length,
            list: list,
        }
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

        product.loadAllByFavorite(res.locals.layoutModels.curUser.id).then(function(rows){
            var box = [];   
            for (var i = 0; i < data.list.length; i++) {
                var bool = rows.findIndex(function(element){
                    return element.ProID === data.list[i].ProID;
                });

                var isLoved = false;
                if(bool !== -1)
                {
                    isLoved = true;
                }
                var temp = {
                    product: data.list[i],
                    isLoved: isLoved,
                }
                box.push(temp);
            }
            res.render('product/search', {
                layoutModels: res.locals.layoutModels,
                box: box,
                isEmpty: data.total === 0,
                text: text,
                findBy: findBy,
                arrange: arrange,
                length: products.length,

                pages: pages,
                curPage: curPage,
                prevPage: curPage - 1,
                nextPage: curPage + 1,
                showPrevPage: curPage > 1,
                showNextPage: curPage < number_of_pages - 1,
            });
        });
    });
});

productRoute.get('/byFavorite', function(req, res) {

    var rec_per_page = 6;
    var curPage = req.query.page ? req.query.page : 1;
    var offset = (curPage - 1) * rec_per_page;
    var userIDcurrent = -1;
    if (res.locals.layoutModels.isLogged)
        userIDcurrent = res.locals.layoutModels.curUser.id;
    product.loadPageByFavorite(userIDcurrent, rec_per_page, offset).then(function(data) {
        console.log("[ProductRoute] Da lay danh sach yeu thich: SoLuong = " + data.list.length)
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

        res.render('product/byUser', {
            layoutModels: res.locals.layoutModels,
            products: data.list,
            isEmpty: data.total === 0,
            catId: req.params.id,
            isLoggedOut: userIDcurrent === -1,
            isInListWinAuction: false,
            pages: pages,
            curPage: curPage,
            prevPage: curPage - 1,
            nextPage: curPage + 1,
            showPrevPage: curPage > 1,
            showNextPage: curPage < number_of_pages - 1,
        });
    });
});

productRoute.get('/byAuction', function(req, res) {

    var rec_per_page = 6;
    var curPage = req.query.page ? req.query.page : 1;
    var offset = (curPage - 1) * rec_per_page;
    var userIDcurrent = -1;
    if (res.locals.layoutModels.isLogged)
        userIDcurrent = res.locals.layoutModels.curUser.id;
    product.loadPageByAuction(userIDcurrent, rec_per_page, offset).then(function(data) {
        console.log("[ProductRoute] Da lay danh sach yeu thich: SoLuong = " + data.list.length)
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

        res.render('product/byUser', {
            layoutModels: res.locals.layoutModels,
            products: data.list,
            isEmpty: data.total === 0,
            catId: req.params.id,
            isLoggedOut: userIDcurrent === -1,
            isInListWinAuction: false,
            pages: pages,
            curPage: curPage,
            prevPage: curPage - 1,
            nextPage: curPage + 1,
            showPrevPage: curPage > 1,
            showNextPage: curPage < number_of_pages - 1,
        });
    });
});

module.exports = productRoute;