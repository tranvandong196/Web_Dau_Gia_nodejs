var express = require('express');
var product = require('../models/product');
var auction = require('../models/auction');
var blacklist = require('../models/blacklist');
var moment = require('moment');
var productRoute = express.Router();
var category = require('../models/category');
var restrict = require('../middle-wares/restrict');
var multer  = require('multer');
var fs = require('fs');
var thumb = require('node-thumbnail').thumb;
var favorite = require('../models/favorite');
var Q = require('q');
var moment = require('moment');
var feedback = require('../models/feedback');

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
            nextPage: curPage - (-1),
            showPrevPage: curPage > 1,
            showNextPage: curPage < number_of_pages - 1,
        });
    });
});


productRoute.post('/detail/:id', function(req, res){

    product.loadDetail(req.params.id)
    .then(function(pro) {

       var dir='./public/info';
       dir = dir + '/' + req.params.id;
       var desc = req.body.desc;
       var fullDes;
       var proId = req.params.id;
       var entity = {
        desc:desc,
        proId:proId,
    };
    fullDes=pro.FullDes;
    var now = new Date(Date.now()).toLocaleString();
    now = moment().format('YYYY-MM-DD');

    fs.appendFile(dir + '/desc.txt','\r\n' + 'EDIT (' + now + ')'+ '\r\n' + desc, (err) => {
        if (err) throw err;
    });
    desc = fullDes +' ' + desc;
    entity.desc = desc;
    Q.all([
        product.updateFullDes(entity)
        ]).spread(function(changedRows){
            res.redirect('/product/detail/' + proId);
        });

    });

});

productRoute.get('/detail/:id', function(req, res) {
    var indexs = [];
    var user = res.locals.layoutModels.curUser;
    product.loadDetail(req.params.id)
    .then(function(pro) {
        var indexs = [];
        if(!pro.PriceToBuy)
        {
            pro.PriceToBuy = -1;
        }
        pro.TimeUp = moment(pro.TimeUp, 'YYYY-MM-DD HH:mm:ss').format('LLL');
        pro.TimeDown = moment(pro.TimeDown, 'YYYY-MM-DD HH:mm:ss').format('LLL');
        fs.readdir('./public/images/' + req.params.id, (err, files) => {
            for(var i = 1; i < files.length; i++)
            {
                var temp = {stt: i,};
                indexs.push(temp);
            }
            var history='';
            var dir = './public/info';
            if(!fs.existsSync(dir))
            {
                fs.mkdirSync(dir);
            }
            dir = dir + '/' + pro.ProID;
            if(!fs.existsSync(dir))
            {
                fs.mkdirSync(dir);
                fs.closeSync(fs.openSync(dir + '/history.txt', 'w'));
            }
            if(user)
            {
                var entity = {
                    proID: req.params.id,
                    userID: user.id,
                };
                if(!fs.existsSync(dir))
                {
                    fs.readFile(dir, 'utf8', (err, data) => {
                      if (err) throw err;
                      history = data;
                  });
                }
                favorite.isLoved(entity).then(function(isLoved){
                    var score = user.score;
                    var x = parseFloat(0.8);
                    if (pro) {
                        Q.all([
                            auction.findMaxPrice(pro.ProID), auction.findHandlePrice(pro.ProID), product.findSolder(pro.ProID)
                            ]).done(function(rs){
                                var curPrice = pro.Price;
                                var handlePrice = {
                                    Name: 'Trống',
                                    Score: 0.0,
                                    ID: 0,
                                };
                                var solder = {
                                    Name: 'Trống',
                                    Score: 0.0,
                                    ID: 0,
                                };
                                if(rs[1])
                                {
                                    handlePrice.Name = rs[1].Name;
                                    handlePrice.Score = rs[1].Score;
                                    handlePrice.ID = rs[1].ID;
                                }
                                if(rs[2])
                                {
                                    solder.Name = rs[2].Name;
                                    solder.Score = rs[2].Score;
                                    solder.ID = rs[2].ID;
                                }
                                if(rs[0])
                                    curPrice = rs[0];
                                if(solder.ID !== user.id)
                                {
                                    handlePrice.Name = handlePrice.Name[0] + '****' + handlePrice.Name[handlePrice.Name.length - 1];
                                }
                                blacklist.loadByProID(pro.ProID).then(function(rows){
                                    var inBlackList = false;
                                    if(rows)
                                    {
                                        rows.forEach( function(element, index) {
                                            if(element.AuctorID === user.id)
                                            {
                                                inBlackList = true;
                                            }
                                        });
                                    }
                                    res.render('product/detail', {
                                        layoutModels: res.locals.layoutModels,
                                        product: pro,
                                        isPermit: score > x && solder.ID !== user.id && inBlackList == false,
                                        isAlive: pro.State === 'đang đấu giá',
                                        isEnd: pro.State === 'đã kết thúc',
                                        handlePrice: handlePrice,
                                        solder: solder,
                                        curPrice: curPrice,
                                        indexs: indexs,
                                        history: history,
                                        proID: req.params.id,
                                        isLoved: isLoved,
                                        isSolder: solder.ID === user.id,
                                        hasPrice2Buy: pro.PriceToBuy !== -1,
                                    });
                                });
                            });

                        } else {
                            res.redirect('/home');
                        }
                    });
            }
            else
            {
                var score = 0;
                var x = parseFloat(0.8);
                if (pro) {
                    Q.all([
                        auction.findMaxPrice(pro.ProID), auction.findHandlePrice(pro.ProID), product.findSolder(pro.ProID)
                        ]).done(function(rs){
                            var curPrice = pro.Price;
                            var handlePrice = {
                                Name: 'Trống',
                                Score: 0.0,
                                ID: 0,
                            };
                            var solder = {
                                Name: 'Trống',
                                Score: 0.0,
                                ID: 0,
                            };
                            if(rs[1])
                            {
                                handlePrice.Name = rs[1].Name;
                                handlePrice.Score = rs[1].Score;
                                handlePrice.ID = rs[1].ID;
                            }
                            if(rs[2])
                            {
                                solder.Name = rs[2].Name;
                                solder.Score = rs[2].Score;
                                solder.ID = rs[2].ID;
                            }
                            if(rs[0])
                                curPrice = rs[0];
                            res.render('product/detail', {
                                layoutModels: res.locals.layoutModels,
                                product: pro,
                                isPermit: false,
                                isAlive: pro.State === 'đang đấu giá',
                                isEnd: pro.State === 'đã kết thúc',
                                handlePrice: handlePrice,
                                solder: solder,
                                curPrice: curPrice,
                                indexs: indexs,
                                history: history,
                                proID: req.params.id,
                                hasPrice2Buy: pro.PriceToBuy !== -1,

                                isLoved: false,
                                hasPrice2Buy: pro.PriceToBuy !== -1,
                                isLoved: false,
                            });
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

productRoute.post('/add/:userID', function(req, res) {
    var dir = './public/images';
    if(!fs.existsSync(dir))
    {
        fs.mkdirSync(dir);
    }
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
            if(files.length < 3)
            {
                res.render('product/add', {
                    layoutModels: res.locals.layoutModels,
                    showMsg: true,
                    error: true,
                    msg: 'Tối thiểu 3 hình ảnh cho 1 sản phẩm.'
                });
                return;
            }
            var id = req.params.userID;
            var now = new Date(Date.now()).toLocaleString();
            now = moment().format('YYYY-MM-DD HH:mm:ss');
            var timeDown = moment(req.body.timeDown, 'D/M/YYYY').format('YYYY-MM-DD HH:mm:ss');
            if(timeDown <= now)
            {
                res.render('product/add', {
                    layoutModels: res.locals.layoutModels,
                    showMsg: true,
                    error: true,
                    msg: 'Thời gian hết hạn không hợp lệ.',
                });
                return;
            }
            var price2Buy = null;
            if(req.body.priceToBuy)
                price2Buy = req.body.priceToBuy;
            var entity = {
                proName: req.body.proName,
                userID: id,
                tinyDes: req.body.tinyDes,
                fullDes: req.body.fullDes,
                price: req.body.price,
                priceToBuy: req.body.priceToBuy,
                catID: catID,
                quantity: req.body.quantity,
                timeDown: timeDown,
                timeUp: now,
                handleID: null,
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
                     var desc = ''//Description
                     var dir2 = './public/info';
                     if(!fs.existsSync(dir2))
                     {
                        fs.mkdirSync(dir2);
                    }
                    dir2 = dir2 + '/' + insertId;
                    if(!fs.existsSync(dir2))
                    {
                        fs.mkdirSync(dir2);
                        fs.closeSync(fs.openSync(dir2 + '/desc.txt', 'w'));
                    }
                    else
                    {
                        fs.unlinkSync(dir2);
                        fs.mkdirSync(dir2);
                        fs.closeSync(fs.openSync(dir2 + '/desc.txt', 'w'));
                    }
                    fs.writeFile(dir2 + '/desc.txt','mô tả cũ' + '\r\n' + req.body.fullDes, (err) => {
                        if (err) throw err;
                    });//End Description

                    dest = dir + '/' + insertId;
                    if(!fs.existsSync(dest))
                        fs.mkdirSync(dest);
                    var size = files.length;
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
            var tmp = {
                item: null,
                isNew: false,
                hasPrice2Buy: true,
            }
            var d = Date.now() - products[i].TimeUp;
            var diffMinutes = parseInt(d / (1000 * 60));
            if(diffMinutes <= 10)
            {
                tmp.isNew = true;
            }
            tmp.item = products[i];
            tmp.hasPrice2Buy = products[i].PriceToBuy !== null;
            list.push(tmp);
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

            //the same with /search/removeLove ; get /search and post /search
            var curUserID;
            if(res.locals.layoutModels.curUser)
                curUserID = res.locals.layoutModels.curUser.id;
            product.loadAllByFavorite(curUserID).then(function(rows){
                var box = [];
                var promise = [];
                for (var i = 0; i < data.list.length; i++) {
                    var bool = -1;
                    if(rows)
                    {
                        bool = rows.findIndex(function(element){
                            return element.ProID === data.list[i].item.ProID;
                        });
                    }
                    promise.push(product.getNumberOfAuction(data.list[i].item.ProID));
                    promise.push(auction.findHandlePrice(data.list[i].item.ProID));
                    promise.push(product.findSolder(data.list[i].item.ProID));
                    var isLoved = false;
                    if(bool !== -1)
                    {
                        isLoved = true;
                    }
                    var d = products[i].TimeDown - Date.now();
                    var diffDays = parseInt(d / (1000 * 3600 * 24)); 
                    var hours = parseInt((d - diffDays * 24 * 3600 * 1000) / (1000 * 3600));
                    var minutes = parseInt((d - diffDays * 24 * 3600 * 1000 - hours * 1000 * 3600) / (1000 * 60));
                    var restTime = diffDays + ' ngày ' + hours + ' giờ ' + minutes + ' phút';
                    var temp = {
                        data: data.list[i],
                        isLoved: isLoved,
                        restTime: restTime,
                        numberOfAuctions: 0,
                        handlePrice: -1,
                    }
                    box.push(temp);
                }
                Q.all(promise).done(function(rs){
                    var k = 0;
                    for(var i = 0; i < box.length; i++)
                    {
                        box[i].numberOfAuctions = rs[k];
                        var tmp = rs[k + 1];
                        if(tmp)
                            box[i].handlePrice = tmp.Name[0] + '****' + tmp.Name[tmp.Name.length - 1];
                        else
                            box[i].handlePrice = 'Chưa có';
                        tmp = rs[k + 2];
                        if(tmp)
                        {
                            if(tmp.ID === curUserID)
                            {
                                box[i].handlePrice = tmp.Name;
                            }
                        }
                        k = k + 3;
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
                        nextPage: curPage - (-1),
                        showPrevPage: curPage > 1,
                        showNextPage: curPage < number_of_pages - 1,
                    });
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
            var tmp = {
                item: null,
                isNew: false,
                hasPrice2Buy: true,
            }
            var d = Date.now() - products[i].TimeUp;
            var diffMinutes = parseInt(d / (1000 * 60));
            if(diffMinutes <= 10)
            {
                tmp.isNew = true;
            }
            tmp.item = products[i];
            tmp.hasPrice2Buy = products[i].PriceToBuy !== null;
            list.push(tmp);
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
            //the same with /search/removeLove ; get /search and post /search
            var curUserID;
            if(res.locals.layoutModels.curUser)
                curUserID = res.locals.layoutModels.curUser.id;
            product.loadAllByFavorite(curUserID).then(function(rows){
                var box = [];
                var promise = [];
                for (var i = 0; i < data.list.length; i++) {
                    var bool = -1;
                    if(rows)
                    {
                        bool = rows.findIndex(function(element){
                            return element.ProID === data.list[i].item.ProID;
                        });
                    }
                    promise.push(product.getNumberOfAuction(data.list[i].item.ProID));
                    promise.push(auction.findHandlePrice(data.list[i].item.ProID));
                    promise.push(product.findSolder(data.list[i].item.ProID));
                    var isLoved = false;
                    if(bool !== -1)
                    {
                        isLoved = true;
                    }
                    var d = products[i].TimeDown - Date.now();
                    var diffDays = parseInt(d / (1000 * 3600 * 24)); 
                    var hours = parseInt((d - diffDays * 24 * 3600 * 1000) / (1000 * 3600));
                    var minutes = parseInt((d - diffDays * 24 * 3600 * 1000 - hours * 1000 * 3600) / (1000 * 60));
                    var restTime = diffDays + ' ngày ' + hours + ' giờ ' + minutes + ' phút';
                    var temp = {
                        data: data.list[i],
                        isLoved: isLoved,
                        restTime: restTime,
                        numberOfAuctions: 0,
                        handlePrice: -1,
                    }
                    box.push(temp);
                }
                Q.all(promise).done(function(rs){
                    var k = 0;
                    for(var i = 0; i < box.length; i++)
                    {
                        box[i].numberOfAuctions = rs[k];
                        var tmp = rs[k + 1];
                        if(tmp)
                            box[i].handlePrice = tmp.Name[0] + '****' + tmp.Name[tmp.Name.length - 1];
                        else
                            box[i].handlePrice = 'Chưa có';
                        tmp = rs[k + 2];
                        if(tmp)
                        {
                            if(tmp.ID === curUserID)
                            {
                                box[i].handlePrice = tmp.Name;
                            }
                        }
                        k = k + 3;
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
                        nextPage: curPage - (-1),
                        showPrevPage: curPage > 1,
                        showNextPage: curPage < number_of_pages - 1,
                    });
                });
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
        var tmp = {
            item: null,
            isNew: false,
            hasPrice2Buy: true,
        }
        var d = Date.now() - products[i].TimeUp;
        var diffMinutes = parseInt(d / (1000 * 60));
        if(diffMinutes <= 10)
        {
            tmp.isNew = true;
        }
        tmp.item = products[i];
        tmp.hasPrice2Buy = products[i].PriceToBuy !== null;
        list.push(tmp);
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
            isActive: i === +curPage,
        });
    }
        //the same with /search/removeLove ; get /search and post /search
        var curUserID;
        if(res.locals.layoutModels.curUser)
            curUserID = res.locals.layoutModels.curUser.id;
        product.loadAllByFavorite(curUserID).then(function(rows){
            var box = [];
            var promise = [];
            for (var i = 0; i < data.list.length; i++) {
                var bool = -1;
                if(rows)
                {
                    bool = rows.findIndex(function(element){
                        return element.ProID === data.list[i].item.ProID;
                    });
                }
                promise.push(product.getNumberOfAuction(data.list[i].item.ProID));
                promise.push(auction.findHandlePrice(data.list[i].item.ProID));
                promise.push(product.findSolder(data.list[i].item.ProID));
                var isLoved = false;
                if(bool !== -1)
                {
                    isLoved = true;
                }
                var d = products[i].TimeDown - Date.now();
                var diffDays = parseInt(d / (1000 * 3600 * 24));
                var hours = parseInt((d - diffDays * 24 * 3600 * 1000) / (1000 * 3600));
                var minutes = parseInt((d - diffDays * 24 * 3600 * 1000 - hours * 1000 * 3600) / (1000 * 60));
                var restTime = diffDays + ' ngày ' + hours + ' giờ ' + minutes + ' phút';
                var temp = {
                    data: data.list[i],
                    isLoved: isLoved,
                    restTime: restTime,
                    numberOfAuctions: 0,
                    handlePrice: 'Chưa có',
                }
                box.push(temp);
            }
            Q.all(promise).done(function(rs){
                var k = 0;
                for(var i = 0; i < box.length; i++)
                {
                    box[i].numberOfAuctions = rs[k];
                    var tmp = rs[k + 1];
                    if(tmp)
                        box[i].handlePrice = tmp.Name[0] + '****' + tmp.Name[tmp.Name.length - 1];
                    else
                        box[i].handlePrice = 'Chưa có';
                    var tmp1 = rs[k + 2];
                    if(tmp)
                    {
                        if(tmp1.ID === curUserID)
                        {
                            box[i].handlePrice = tmp1.Name;
                        }
                    }
                    k = k + 3;
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
                    nextPage: curPage - (-1),
                    showPrevPage: curPage > 1,
                    showNextPage: curPage < number_of_pages - 1,
                });
            });
        });
    });
});

productRoute.get('/search', function(req, res) {
    var rec_per_page = 6;
    var curPage = req.query.page ? req.query.page : 1;
    var offset = (curPage - 1) * rec_per_page;
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
        var tmp = {
            item: null,
            isNew: false,
            hasPrice2Buy: true,
        }
        var d = Date.now() - products[i].TimeUp;
        var diffMinutes = parseInt(d / (1000 * 60));
        if(diffMinutes <= 10)
        {
            tmp.isNew = true;
        }
        tmp.item = products[i];
        tmp.hasPrice2Buy = products[i].PriceToBuy !== null;
        list.push(tmp);
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
        //the same with /search/removeLove ; get /search and post /search
        var curUserID;
        if(res.locals.layoutModels.curUser)
            curUserID = res.locals.layoutModels.curUser.id;
        product.loadAllByFavorite(curUserID).then(function(rows){
            var box = [];
            var promise = [];
            for (var i = 0; i < data.list.length; i++) {
                var bool = -1;
                if(rows)
                {
                    bool = rows.findIndex(function(element){
                        return element.ProID === data.list[i].item.ProID;
                    });
                }
                promise.push(product.getNumberOfAuction(data.list[i].item.ProID));
                promise.push(auction.findHandlePrice(data.list[i].item.ProID));
                promise.push(product.findSolder(data.list[i].item.ProID));
                var isLoved = false;
                if(bool !== -1)
                {
                    isLoved = true;
                }
                var d = products[i].TimeDown - Date.now();
                var diffDays = parseInt(d / (1000 * 3600 * 24)); 
                var hours = parseInt((d - diffDays * 24 * 3600 * 1000) / (1000 * 3600));
                var minutes = parseInt((d - diffDays * 24 * 3600 * 1000 - hours * 1000 * 3600) / (1000 * 60));
                var restTime = diffDays + ' ngày ' + hours + ' giờ ' + minutes + ' phút';
                var temp = {
                    data: data.list[i],
                    isLoved: isLoved,
                    restTime: restTime,
                    numberOfAuctions: 0,
                    handlePrice: -1,
                }
                box.push(temp);
            }
            Q.all(promise).done(function(rs){
                var k = 0;
                for(var i = 0; i < box.length; i++)
                {
                    box[i].numberOfAuctions = rs[k];
                    var tmp = rs[k + 1];
                    if(tmp)
                        box[i].handlePrice = tmp.Name[0] + '****' + tmp.Name[tmp.Name.length - 1];
                    else
                        box[i].handlePrice = 'Chưa có';;
                    tmp = rs[k + 2];
                    if(tmp)
                    {
                        if(tmp.ID === curUserID)
                        {
                            box[i].handlePrice = tmp.Name;
                        }
                    }
                    k = k + 3;
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
                    nextPage: curPage - (-1),
                    showPrevPage: curPage > 1,
                    showNextPage: curPage < number_of_pages - 1,
                });
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
        var box = [];   
        for (var i = 0; i < data.list.length; i++) {
            var temp = {
                product: data.list[i],
                canRemoveProduct: true
            }
            box.push(temp);
        }
        res.render('product/byUser', {
            layoutModels: res.locals.layoutModels,
            box: box,
            total: data.total,
            isEmpty: data.total === 0,
            catId: req.params.id,
            Tile: 'Sản phẩm yêu thích',
            pages: pages,
            curPage: curPage,
            prevPage: curPage - 1,
            nextPage: curPage - (-1),
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
        var box = [];   
        for (var i = 0; i < data.list.length; i++) {
            var temp = {
                product: data.list[i],
            }
            box.push(temp);
        }
        res.render('product/byUser', {
            layoutModels: res.locals.layoutModels,
            box: box,
            total: data.total,
            isEmpty: data.total === 0,
            catId: req.params.id,
            Tile: 'Sản phẩm đang đấu giá',
            pages: pages,
            curPage: curPage,
            prevPage: curPage - 1,
            nextPage: curPage - (-1),
            showPrevPage: curPage > 1,
            showNextPage: curPage < number_of_pages - 1,
        });
    });
});
productRoute.get('/byBasket', function(req, res) {
    var rec_per_page = 6;
    var curPage = req.query.page ? req.query.page : 1;
    var offset = (curPage - 1) * rec_per_page;
    var userIDcurrent = -1;
    if (res.locals.layoutModels.isLogged)
        userIDcurrent = res.locals.layoutModels.curUser.id;
    product.loadPageByBasket(userIDcurrent, rec_per_page, offset).then(function(data) {
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
        var box = [];
        var promise = [];
        for (var i = 0; i < data.list.length; i++) {
             var temp = {
                product: data.list[i],
                canGiveScore_comment_toSeller: true,
                isGaveScore: false,
                isPlus: false,
                isGaveComment: false,
            }
            var entity = {
                proID: data.list[i].ProID,
                receiverID: data.list[i].UserID,
                senderID: data.list[i].HandleID,
            };
            promise.push(feedback.isGaveScore(entity));
            promise.push(feedback.isGaveComment(entity));
            box.push(temp);
        }
        Q.all(promise).done(function(rs){
            var k = 0;
            box.forEach( function(element, index) {
                if(rs[k] == 1)
                {
                    element.isGaveScore = true;
                    element.isPlus = true;
                }
                else if(rs[k] == -1)
                {
                    element.isGaveScore = true;
                    element.isPlus = false;
                }
                if(rs[k + 1])
                {
                    element.isGaveComment = true;
                }
                k = k + 2;
            });
            res.render('product/byUser', {
                layoutModels: res.locals.layoutModels,
                box: box,
                total: data.total,
                isEmpty: data.total === 0,
                catId: req.params.id,
                Tile: 'Sản phẩm thắng đấu giá - giỏ hàng',
                pages: pages,
                curPage: curPage,
                prevPage: curPage - 1,
                nextPage: curPage - (-1),
                showPrevPage: curPage > 1,
                showNextPage: curPage < number_of_pages - 1,
            });
        });
    });
});

productRoute.get('/byOnSale', function(req, res) {

    var rec_per_page = 6;
    var curPage = req.query.page ? req.query.page : 1;
    var offset = (curPage - 1) * rec_per_page;
    var userIDcurrent = -1;
    if (res.locals.layoutModels.isLogged)
        userIDcurrent = res.locals.layoutModels.curUser.id;
    product.loadPageByOnSale(userIDcurrent, rec_per_page, offset).then(function(data) {
        console.log("[ProductRoute] Da lay danh sach SP dang ban: SoLuong = " + data.list.length)
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
        var box = [];   
        for (var i = 0; i < data.list.length; i++) {
            var temp = {
                product: data.list[i]
            }
            box.push(temp);
        }
        res.render('product/byUser', {
            layoutModels: res.locals.layoutModels,
            box: box,
            total: data.total,
            isEmpty: data.total === 0,
            catId: req.params.id,
            Tile: 'Sản phẩm đang bán',
            pages: pages,
            curPage: curPage,
            prevPage: curPage - 1,
            nextPage: curPage - (-1),
            showPrevPage: curPage > 1,
            showNextPage: curPage < number_of_pages - 1,
        });
    });
});
productRoute.get('/bySold', function(req, res) {

    var rec_per_page = 6;
    var curPage = req.query.page ? req.query.page : 1;
    var offset = (curPage - 1) * rec_per_page;
    var userIDcurrent = -1;
    if (res.locals.layoutModels.isLogged)
        userIDcurrent = res.locals.layoutModels.curUser.id;
    product.loadPageBySold(userIDcurrent, rec_per_page, offset).then(function(data) {
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
        var box = [];   
        var promise = [];
        for (var i = 0; i < data.list.length; i++) {
            var temp = {
                product: data.list[i],
                canGiveScore_comment_toBuyer: true,
                isGaveScore: false,
                isPlus: false,
                isGaveComment: false,
            }
            var entity = {
                proID: data.list[i].ProID,
                receiverID: data.list[i].HandleID,
                senderID: data.list[i].UserID,
            };
            promise.push(feedback.isGaveScore(entity));
            promise.push(feedback.isGaveComment(entity));
            box.push(temp);
        }
        Q.all(promise).done(function(rs){
            var k = 0;
                box.forEach( function(element, index) {
                if(rs[k] == 1)
                {
                    element.isGaveScore = true;
                    element.isPlus = true;
                }
                else if(rs[k] == -1)
                {
                    element.isGaveScore = true;
                    element.isPlus = false;
                }
                if(rs[k + 1])
                {
                    element.isGaveComment = true;
                }
                k = k + 2;
            });
            res.render('product/byUser', {
                layoutModels: res.locals.layoutModels,
                box: box,
                total: data.total,
                isEmpty: data.total === 0,
                catId: req.params.id,
                Tile: 'Sản phẩm đã bán',
                pages: pages,
                curPage: curPage,
                prevPage: curPage - 1,
                nextPage: curPage - (-1),
                showPrevPage: curPage > 1,
                showNextPage: curPage < number_of_pages - 1,
            });
        });
    });
});

productRoute.get('/byUser/removeLove/:id', function(req, res){
    var id = req.params.id;
    var user = res.locals.layoutModels.curUser;
    var entity = {
        proID: id,
        userID: user.id,
    };
    favorite.delete(entity).then(function(affectedRows){
        res.redirect('/product/byFavorite')
    });
});
module.exports = productRoute;