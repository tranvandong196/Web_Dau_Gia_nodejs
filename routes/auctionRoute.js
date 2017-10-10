var express = require('express');
var moment = require('moment');

var account = require('../models/account');
var product = require('../models/product');
var auction = require('../models/auction');
var blacklist = require('../models/blacklist');
var cart = require('../models/cart');
var restrict = require('../middle-wares/restrict');
var fs = require('fs');
var Q = require('q');

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
        var price2Buy = -1;
        if(pro.PriceToBuy)
            price2Buy = pro.PriceToBuy;
        auction.insert(entity).then(function(insertId){
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
            fs.appendFile(dir + '/history.txt', tmp, (err) =>
            {
                if (err)
                    throw err;
            });
            auction.findHandlePrice(pro.ProID).then(function(user){
                product.updateHandlePrice(pro.ProID, user.ID).then(function(changedRows){
                    if(price2Buy !== -1 && req.body.price >= price2Buy)
                    {
                        product.updateState(pro.ProID, 'Đã kết thúc').then(function(changedRows){
                            //gửi cho người thắng
                            var mail = {
                              from: 'dgnhanh@gmail.com',
                              to: user.Email,
                              subject: 'Đấu giá thắng',
                              text: 'Chúc mừng, bạn đã đấu giá thành công sản phẩm ' + pro.ProName + ' với giá ' + req.body.price + 'đồng',
                            };
                            transporter.sendMail(mail, function(error, info){
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent to: ' + user.Email);
                                }
                            });
                            product.findSolder(pro.ProID).then(function(solder){
                                //gửi cho người bán
                                mail = {
                                  from: 'dgnhanh@gmail.com',
                                  to: solder.Email,
                                  subject: 'Đấu giá xong',
                                  text: 'Xin chào, ' + user.Username + ' đã đấu giá thành công sản phẩm ' + pro.ProName + ' của bạn với giá ' + req.body.price + 'đồng',
                                };
                                transporter.sendMail(mail, function(error, info){
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log('Email sent to: ' + solder.Email);
                                    }
                                });
                                auction.loadAllAuctorByProID(pro.ProID).then(function(rs){
                                    if(rs)
                                    {
                                        rs.forEach( function(element, index) {
                                            if(element.ID !== user.ID)
                                            {
                                                mail = {
                                                  from: 'dgnhanh@gmail.com',
                                                  to: element.Email,
                                                  subject: 'Đấu giá kết thúc',
                                                  text: 'Xin chào, ' + user.Username + ' đã đấu giá thành công sản phẩm ' + pro.ProName 
                                                  + ' mà bạn đã tham gia đấu giá. Sản phẩm được bán với giá là ' + req.body.price + 'đồng',
                                                };
                                                transporter.sendMail(mail, function(error, info){
                                                if (error) {
                                                    console.log(error);
                                                } else {
                                                    console.log('Email sent to: ' + element.Email);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                    res.redirect('/product/detail/' + req.body.proID);
                                }); 
                            });
                        });
                    }
                    else
                    {
                        var mail = {
                          from: 'dgnhanh@gmail.com',
                          to: user.Email,
                          subject: 'Đặt giá thành công',
                          text: 'Bạn đã đấu giá sản phẩm ' + pro.ProName + ' với giá ' + req.body.price + 'đồng',
                        };
                        transporter.sendMail(mail, function(error, info){
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent to: ' + user.Email);
                            }
                        });
                        product.findSolder(pro.ProID).then(function(solder){
                            //gửi cho người bán
                            mail = {
                              from: 'dgnhanh@gmail.com',
                              to: solder.Email,
                              subject: 'Sản phẩm được đấu giá',
                              text: 'Xin chào, ' + user.Username + ' đã đấu giá sản phẩm ' + pro.ProName + ' của bạn với giá ' + req.body.price + 'đồng',
                            };
                            transporter.sendMail(mail, function(error, info){
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent to: ' + solder.Email);
                                }
                            });
                            res.redirect('/product/detail/' + req.body.proID);
                        });
                    }
                });
            });
        });
    });
});

auctionRoute.get('/history/:id', restrict, function(req, res) {
    var proID = req.params.id;
    var isSolder = false;
    var curUser = res.locals.layoutModels.curUser;
    product.findSolder(proID).then(function(solder){
        if(solder.ID === curUser.id)
        {
            isSolder = true;
        }
        var box = [];
        var promise = [];
        auction.loadAllAuctionByProID(proID).then(function(rs){
            rs.forEach( function(element, index) {
                element.Date = moment(element.Date).format('LLL');
                var tmp = {
                    item: element,
                    auctor: null,
                    isMyName: false,
                }
                box.push(tmp);
                promise.push(account.load(element.UserID));
            });
            Q.all(promise).done(function(rs){
                rs.forEach( function(element, index) {
                    if(!isSolder && element.ID !== curUser.id)
                    {
                        element.Name = element.Name[0] + '****' + element.Name[element.Name.length - 1];
                    }
                    box[index].auctor = element;
                    box[index].isMyName = element.ID === curUser.id;
                });
                product.loadDetail(proID).then(function(pro){
                    res.render('auction/history', {
                        layoutModels: res.locals.layoutModels,
                        isEmpty: box.length == 0,
                        box: box,
                        isSolder: isSolder,
                        product: pro,
                        isAlive: pro.State === "đang đấu giá",
                    });
                });
            });
        });
    });
});

auctionRoute.get('/history', restrict, function(req, res) {
    var proID = req.query.proID;
    var auctorID = req.query.auctorID;
    var curUser = res.locals.layoutModels.curUser;
    var entity = {
        proID: proID,
        auctorID: auctorID,
    };
    product.loadDetail(proID).then(function(pro){
        if(pro.State !== 'đang đấu giá')
        {
            res.redirect('/auction/history/' + proID);
            return;
        }
        auction.deleteAuctorFromProduct(entity).then(function(affectedRows){
            account.load(auctorID).then(function(user){
                blacklist.insert(entity).then(function(insertId){
                    auction.findHandlePrice(pro.ProID).then(function(rs){
                        var uID = null;
                        if(rs)
                            uID = rs.ID;
                        product.updateHandlePrice(proID, uID).then(function(changedRows){
                            console.log(changedRows);
                            var mail = {
                              from: 'dgnhanh@gmail.com',
                              to: user.Email,
                              subject: 'Đấu giá sản phẩm',
                              text: 'Rất tiêc, bạn đã bị kick ra khỏi phiên đấu giá sản phẩm ' + pro.ProName
                               + '. Bạn sẽ không thể đấu giá sản phẩm này trong tương lai.',
                            };
                            transporter.sendMail(mail, function(error, info){
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent to: ' + user.Email);
                                }
                            });
                            res.redirect('/auction/history/' + proID);
                        });
                    });            
                });
            });
        });
    });
});
module.exports = auctionRoute;