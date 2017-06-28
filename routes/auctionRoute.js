var express = require('express');
var moment = require('moment');

var product = require('../models/product');
var auction = require('../models/auction');
var cart = require('../models/cart');
var restrict = require('../middle-wares/restrict');
var fs = require('fs');

var currencyFormatter = require('currency-formatter');
var auctionRoute = express.Router();

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dgnhanh@gmail.com',
    pass: 'dgn123456'
  }
});

var mailSuccessAuction = {
  from: 'dgnhanh@gmail.com',
  to: 'tmpdat1206@gmail.com',
  subject: 'Kết quả đấu giá sản phẩm.',
  text: 'Sản phẩm đã được đấu giá xong!'
};

// transporter.sendMail(mailSuccessAuction, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// }); 

auctionRoute.post('/add', restrict, function(req, res) {
    product.loadDetail(req.body.proID).then(function(pro) {
        var now = new Date(Date.now()).toLocaleString();
        now = moment().format('YYYY-MM-DD HH:mm:ss');
        var entity = {
            price: req.body.price,
            userID: res.locals.layoutModels.curUser.id,
            proID: req.body.proID,
            date: now,
        };
        auction.insert(entity).then(function(insertId){
            var price2Buy = -1;
            if(pro.PriceToBuy)
                price2Buy = pro.PriceToBuy;
            if(price2Buy !== -1 && req.body.price >= price2Buy)
            {
                var item = {
                    product: {
                        ProID: pro.ProID,
                        ProName: pro.ProName,
                        Price: pro.Price,
                    },
                    quantity: 1,
                    amount: pro.Price,
                };
                cart.add(req.session.cart, item);
                transporter.sendMail(mailSuccessAuction, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                    }
                }); 
            }
            var name = res.locals.layoutModels.curUser.username;
            var tmp = '';
            var temp = '';
            var price = req.body.price;
            price = currencyFormatter.format(price, { code: 'VND' });
            for(var i = 0; i < name.length - 1 ; i++)
            {
                temp += '*'
            }
            temp += name[name.length - 1];
            name = temp;
            tmp += now + '  -  ' + name + '  =>  ' + price + '\r\n';
            var dir = './public/info/' + pro.ProID;
            fs.appendFile(dir + '/history.txt', tmp, (err) => {
                if (err) throw err;
            });
            auction.findHandlePrice(pro.ProID).then(function(user){
                product.updateHandlePrice(pro.ProID, user.ID).then(function(changedRows){
                    product.updateState(pro.ProID, 'Đã kết thúc').then(function(changedRows){
                        res.redirect('/product/detail/' + req.body.proID);
                    });
                });
            });
        });
    });
});

auctionRoute.post('/add1', restrict, function(req, res) {
    product.loadDetail(req.body.proId).then(function(pro) {
        var item = {
            product: {
                ProID: pro.ProID,
                ProName: pro.ProName,
                Price: pro.Price,
            },
            quantity: 1,
            amount: pro.Price
        };
        cart.add(req.session.cart, item);
        res.redirect('/product/byCat/' + req.body.catId);
    });
});

auctionRoute.post('/remove', restrict, function(req, res) {
    var proId = +req.body.proId;
    cart.remove(req.session.cart, proId);
    res.redirect('/cart');
});

auctionRoute.post('/update', restrict, function(req, res) {
    var proId = +req.body.proId;
    var quantity = +req.body.quantity;
    cart.update(req.session.cart, proId, quantity);
    res.redirect('/cart');
});

auctionRoute.post('/checkout', restrict, function(req, res) {
    var entity = {
        OrderDate: moment().format('YYYY-MM-DDTHH:mm'),
        UserID: req.session.user.id,
        Total: req.body.total
    };

    order.insert(entity)
    .then(function(orderId) {
        detail.insertAll(req.session.cart, orderId)
        .then(function(idList) {
         req.session.cart = [];
         res.redirect('/cart');
     });
    });
});
auctionRoute.get('/history', restrict, function(req, res) {
    res.render('auction/history', {
        layoutModels: res.locals.layoutModels,
        isEmpty: true,
        //products: itemProduct,
        //auctions: data.list,
    });
});
module.exports = auctionRoute;