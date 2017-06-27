var express = require('express');
var moment = require('moment');

var product = require('../models/product');
var auction = require('../models/auction');
var cart = require('../models/cart');
var restrict = require('../middle-wares/restrict');
var fs = require('fs');
var currencyFormatter = require('currency-formatter');
var auctionRoute = express.Router();

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
            if(pro.priceToBuy)
                price2Buy = pro.priceToBuy;
            if(price2Buy !== -1 && req.body.price >= price2Buy)
            {
                var item = {
                    product: {
                        ProID: pro.ProID,
                        ProName: pro.ProName,
                        Price: pro.Price,
                    },
                    quantity: 1,
                    amount: 1,
                };
                cart.add(req.session.cart, item);
            }

            
            auction.loadUserName().then(function(rows){
                var name='';
                var tmp='';
                var price=req.body.price; 
                price = currencyFormatter.format(price, { code: 'VND' });
                for(var h=0;;h++)
                {
                    if(res.locals.layoutModels.curUser.id == rows[h].ID)
                    {
                        name = rows[h].Username;
                        break;
                    }
                }
                tmp+=now + '  -  ' +name+ '  =>  ' +price + '\r\n';

                fs.appendFile('public/history/'+pro.ProID+'/history.txt', tmp, (err) => {
                    if (err) throw err;
                });
            });

            res.redirect('/product/detail/' + req.body.proID);
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

module.exports = auctionRoute;