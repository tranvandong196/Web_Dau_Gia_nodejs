var express = require('express');
var crypto = require('crypto');
var moment = require('moment');
var category = require('../models/category');
var restrict = require('../middle-wares/restrict');
var restrict1 = require('../middle-wares/restrict1');
var account = require('../models/account');
var product = require('../models/product');
var request = require('../models/request');
var feedback = require('../models/feedback');
var nodemailer = require('nodemailer');
var Q = require('q');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dgnhanh@gmail.com',
    pass: 'dgn123456'
  }
});
var accountRoute = express.Router();

accountRoute.get('/login', function(req, res) {
    if (req.session.isLogged === true) {
        res.redirect('/home');
    } else {
        res.render('account/login', {
            layoutModels: res.locals.layoutModels,
            showMsg: false,
            error: false,
            msg: '',
        });
    }
});

accountRoute.post('/login', function(req, res) {

    var ePWD = crypto.createHash('md5').update(req.body.rawPWD).digest('hex');
    var entity = {
        username: req.body.username,
        password: ePWD,
    };

    var remember = req.body.remember ? true : false;

    account.login(entity)
    .then(function(user) {
        if (user === null) {
            res.render('account/login', {
                layoutModels: res.locals.layoutModels,
                showError: true,
                errorMsg: 'Thông tin đăng nhập không đúng.'
            });
        } else {
            request.loadAll(user.id).then(function(rows){
                var length = 0;
                if(rows)
                    length = rows.length;
                req.session.isLogged = true;
                req.session.isCanSale = user.permission >= 1;
                req.session.isAdmin = user.permission === 2;
                req.session.user = user;
                req.session.cart = [];
                req.session.numberOfRequests = length;

                if (remember === true) {
                    var hour = 1000 * 60 * 60 * 24;
                    req.session.cookie.expires = new Date(Date.now() + hour);
                    req.session.cookie.maxAge = hour;
                }

                var url = '/home';
                if (req.query.retUrl) {
                    url = req.query.retUrl;
                }
                res.redirect(url);
            });
        }
    });
});

accountRoute.post('/logout', restrict, function(req, res) {
    req.session.isLogged = false;
    req.session.isAdmin = false;
    req.session.isCanSale = false;
    req.session.numberOfRequests = 0;
    req.session.user = null;
    req.session.cart = null;
    req.session.cookie.expires = new Date(Date.now() - 1000);
    res.redirect("/home");
});

accountRoute.get('/register', function(req, res) {
    res.render('account/register', {
        layoutModels: res.locals.layoutModels,
        showMsg: false,
        error: false,
        msg: '',
    });
});

accountRoute.post('/register', function(req, res) {

    var ePWD = crypto.createHash('md5').update(req.body.rawPWD).digest('hex');
    var nDOB = moment(req.body.dOB, 'D/M/YYYY').format('YYYY-MM-DDTHH:mm');

    var entity = {
        username: req.body.username,
        password: ePWD,
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        dOB: nDOB,
        permission: 0,
        scorePlus: 0,
        scoreMinus: 0,
        score: 1,
    };

    account.insert(entity)
    .then(function(insertId) {
        if(insertId === -3)
        {
            res.render('account/register', {
                layoutModels: res.locals.layoutModels,
                showMsg: true,
                error: true,
                msg: 'Tên đăng nhập đã có người sử dụng.',
            });
        }
        else if(insertId === -2)
        {
            res.render('account/register', {
                layoutModels: res.locals.layoutModels,
                showMsg: true,
                error: true,
                msg: 'Email này đã có người sử dụng.',
            });
        }
        else if(insertId === -1)
        {
            res.render('account/register', {
                layoutModels: res.locals.layoutModels,
                showMsg: true,
                error: true,
                msg: 'Địa chỉ này đã có người sử dụng.',
            });
        }
        else
        {
            var mail = {
                  from: 'dgnhanh@gmail.com',
                  to: entity.email,
                  subject: 'Đăng ký tài khoản',
                  text: 'Chúc mừng, bạn đã đăng ký tài khoản trên daugianhanh.com.vn thành công. Username: ' + entity.username + ' password: ' + req.body.rawPWD,
            };
            transporter.sendMail(mail, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent to: ' + entity.email);
                }
            });
            res.render('account/register', {
                layoutModels: res.locals.layoutModels,
                showMsg: true,
                error: false,
                msg: 'Đăng ký thành công.',
            });
        }
    });
});

accountRoute.get('/profile/:id', restrict, function(req, res) {
    account.load(req.params.id).then(function(user){
        if(user)
        {
            product.loadWonList(user.ID).then(function(rows){
                var isCanSale = false;
                if(rows)
                {
                    isCanSale = user.Score >= 0.8 && rows.length >= 10;
                }
                user.DOB = moment(user.DOB).format('l');
                request.loadByID(user.ID).then(function(row){
                    var isWaitingForAccept = false;
                    if(row)
                    {
                        isWaitingForAccept = true;
                    }
                    res.render('account/profile', {
                        layoutModels: res.locals.layoutModels,
                        percentScore: user.Score*100,
                        canAuction: user.Score >= 0.8,
                        isCanSale: isCanSale,
                        isWaitingForAccept: isWaitingForAccept,
                        user: user,
                        isMyProfile: true,
                        isTrashAccount: user === null,
                    });
                });
            });
        }
        else
        {
            res.render('account/profile', {
                layoutModels: res.locals.layoutModels,
                isTrashAccount: true,
            });
        }
    })
});

accountRoute.get('/changePassword', restrict, function(req, res) {
    res.render('account/changePassword', {
        layoutModels: res.locals.layoutModels
    });
});

accountRoute.post('/profile', restrict, function(req, res) {
    var nDOB = moment(req.body.dOB).format('YYYY-MM-DDTHH:mm');
    var curUser = res.locals.layoutModels.curUser;
    var entity = {
        id: curUser.id,
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        dOB: nDOB,
        password: curUser.password,
        username: curUser.username,
    };
    account.changeProfile(entity)
    .then(function(rs) {
        account.load(curUser.id).then(function(u){
            u.DOB = moment(u.DOB).format('l');
            if(rs === -2)
            {
                res.render('account/profile', {
                    layoutModels: res.locals.layoutModels,
                    showMsg: true,
                    error: true,
                    msg: 'Email này đã có người sử dụng.',
                    percentScore: u.Score*100,
                    canAuction: u.Score >= 0.8,
                    isCanSale: false,
                    isWaitingForAccept: false,
                    user: u,
                    isMyProfile: true,
                    isTrashAccount: u === null,
                });
            }
            else if(rs === -1)
            {
                res.render('account/profile', {
                    layoutModels: res.locals.layoutModels,
                    showMsg: true,
                    error: true,
                    msg: 'Địa chỉ này đã có người sử dụng.',
                    percentScore: u.Score*100,
                    canAuction: u.Score >= 0.8,
                    isCanSale: false,
                    isWaitingForAccept: false,
                    user: u,
                    isMyProfile: true,
                    isTrashAccount: u === null,
                });
            }
            else
            {
                u.DOB = moment(u.DOB).format('l');
                var user = {
                    id: u.ID,
                    username: u.Username,
                    name: u.Name,
                    email: u.Email,
                    address: u.Address,
                    scorePlus: u.ScorePlus,
                    scoreMinus: u.ScoreMinus,
                    score: u.Score,
                    dOB: u.DOB,
                    permission: u.Permission,
                    password: u.Password,
                };
                res.locals.layoutModels.curUser = user;
                req.session.user = user;
                res.render('account/profile', {
                    layoutModels: res.locals.layoutModels,
                    showMsg: true,
                    error: false,
                    msg: 'Thông tin đã được thay đổi.',
                    percentScore: u.Score*100,
                    canAuction: u.Score >= 0.8,
                    isCanSale: false,
                    isWaitingForAccept: false,
                    user: u,
                    isMyProfile: true,
                    isTrashAccount: u === null,
                });
            }
        });
    });
});

accountRoute.post('/changePassword', restrict, function(req, res) {
    var ePWD = crypto.createHash('md5').update(req.body.rawPWDnew1).digest('hex');
    var PW = crypto.createHash('md5').update(req.body.rawPWDold).digest('hex');
    var entity = {
        id: res.locals.layoutModels.curUser.id,
        password: PW,
        newPW: ePWD,
    };
    account.changePassword(entity).then(function(rs){
        if(rs === -1)
        {
            res.render('account/changePassword', {
                layoutModels: res.locals.layoutModels,
                showMsg: true,
                error: true,
                msg: 'Mật khẩu cũ không đúng.',
            });
        }
        else
        {
            var mail = {
                  from: 'dgnhanh@gmail.com',
                  to: res.locals.layoutModels.curUser.email,
                  subject: 'Đổi mật khẩu',
                  text: 'Chúc mừng, bạn đã đổi mật khẩu thành công. Password mới: ' + req.body.rawPWDnew1,
            };
            transporter.sendMail(mail, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent to: ' + res.locals.layoutModels.curUser.email);
                }
            });
            res.render('account/changePassword', {
                layoutModels: res.locals.layoutModels,
                showMsg: true,
                error: false,
                msg: 'Mật khẩu đã được đổi thành công.',
            });
        }
    });
});

accountRoute.get('/manageUsers', restrict, function(req, res) {
    account.loadAll().then(function(rows){
        for(var i = 0; i < rows.length; i++) {
            // statements
            if(rows[i].ID === res.locals.layoutModels.curUser.id || rows[i].Permission === 1)
            {
                rows.splice(i, 1);
            }
        }
        res.render('account/manageUsers', {
            layoutModels: res.locals.layoutModels,
            users: rows,
            showMsg: false,
            error: false,
            msg: '',
        });
    });
});

accountRoute.post('/delete', restrict, function(req, res) {
    var id = req.body.userID;
    account.delete(id).then(function(affectedRows){
        res.redirect('/account/manageUsers');
    });
});

accountRoute.get('/manageCategories', restrict, function(req, res) {
    category.loadAll().then(function(rows){
       res.render('account/manageCategories', {
            layoutModels: res.locals.layoutModels,
            categories: rows,
            showMsg: false,
            error: false,
            msg: '',
        });
    });
});

accountRoute.get('/manageRequests', restrict, function(req, res) {
    var user = [];
    request.loadAll().then(function(rows){
        if(rows)
        {
            var box = [];
            var promise = [];
            rows.forEach( function(element, index) {
                var tmp = {
                    id: element.UserID,
                    name: "Không rõ",
                };
                box.push(tmp);
                promise.push(account.load(element.UserID));
            });
            Q.all(promise).done(function(rs){
                box.forEach( function(element, index) {
                    element.name = rs[index].Name;
                });
                res.render('account/manageRequests', {
                    layoutModels: res.locals.layoutModels,
                    users: box,
                    isEmpty: box.length === 0,
                });
            });
        }
        else
            res.redirect("/home");
    });
});

accountRoute.get('/manageRequests/accept/:id', restrict, function(req, res) {
    var id = req.params.id;
    request.delete(id).then(function(affectedRows){
        account.updateAccToSeller(id).then(function(changedRows){
            account.load(id).then(function(user){
                var mail = {
                  from: 'dgnhanh@gmail.com',
                  to: user.Email,
                  subject: 'Nâng cấp tài khoản',
                  text: 'Chúc mừng, yêu cầu của bạn đã được chấp nhận. Tài khoản ' + user.Username + ' của bạn trên daugianhanh.com.vn đã được nâng cấp thành tài khoản bán.',
                };
                transporter.sendMail(mail, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent to: ' + user.Email);
                    }
                });
                req.session.numberOfRequests = res.locals.layoutModels.numberOfRequests - 1;
                res.redirect('/account/manageRequests');
            });
        });
    });
});

accountRoute.get('/manageRequests/refuse/:id', restrict, function(req, res) {
    var id = req.params.id;
    request.delete(id).then(function(affectedRows){
        account.load(id).then(function(user){
            var mail = {
              from: 'dgnhanh@gmail.com',
              to: user.Email,
              subject: 'Nâng cấp tài khoản',
              text: 'Rất tiếc, yêu cầu của bạn đã bị từ chối. Tài khoản ' + user.Username + ' của bạn trên daugianhanh.com.vn chưa được nâng cấp thành tài khoản bán.',
            };
            transporter.sendMail(mail, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent to: ' + user.Email);
                }
            });
            req.session.numberOfRequests = res.locals.layoutModels.numberOfRequests - 1;
            res.redirect('/account/manageRequests');
        });
    });
});

accountRoute.get('/resetPW/:id', restrict, function(req, res) {
    var id = req.params.id;
    account.resetPW(id).then(function(changedRows){
        account.load(id).then(function(user){
            var mail = {
                  from: 'dgnhanh@gmail.com',
                  to: user.Email,
                  subject: 'Đổi mật khẩu',
                  text: 'Xin chào, Mật khẩu của bạn đã được reset trên daugianhanh.com.vn. Password mới: 123456',
            };
            transporter.sendMail(mail, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent to: ' + user.Email);
                }
            });
            res.redirect('/account/manageUsers');
        });
    });
});

accountRoute.post('/receiveScore', restrict, function(req, res) {
    var proID = req.body.proID;
    var score = req.body.giveScore;
    var sender = res.locals.layoutModels.curUser;
    var receiverID;
    product.loadDetail(proID).then(function(pro){
        var redirect = '/product/';
        if(sender.id === pro.UserID)
        {
            redirect = redirect + 'bySold';
            receiverID = pro.HandleID;
        }
        else{
            redirect = redirect + 'byBasket';
            receiverID = pro.UserID;
        }
        var entity = {
            proID: proID,
            receiverID: receiverID,
            senderID: sender.id,
            score: score,
        };
        feedback.isGaveScore(entity).then(function(oldScore){
            if(oldScore == score)
            {
                res.redirect(redirect);
                return;
            }
            account.updateScore(receiverID, score, oldScore).then(function(changedRows){
                feedback.insert(entity, oldScore).then(function(insertId){
                    res.redirect(redirect);
                });
            });
        });
        
    });
});

accountRoute.post('/receiveFeedback', restrict, function(req, res) {
    var proID = req.body.proID;
    var comment = req.body.comment;
    var sender = res.locals.layoutModels.curUser;
    var receiverID;
    product.loadDetail(proID).then(function(pro){
        var redirect = '/product/';
        if(sender.id == pro.UserID)
        {
            redirect = redirect + 'bySold';
            receiverID = pro.HandleID;
        }
        else{
            redirect = redirect + 'byBasket';
            receiverID = pro.UserID;
        }
        var entity = {
            proID: proID,
            receiverID: receiverID,
            senderID: sender.id,
            comment: comment,
        };
        feedback.isGaveComment(entity).then(function(rs){
            feedback.isGaveScore(entity).then(function(oldScore){
                if(oldScore == -2)
                {
                    console.log('Thêm nhận xét.')
                    feedback.insertComment(entity).then(function(changedRows){
                        res.redirect(redirect);
                    });
                }
                else
                {
                    console.log('Cập nhật nhận xét.')
                    feedback.updateComment(entity).then(function(changedRows){
                        res.redirect(redirect);
                    });
                }
               
            });
        });
        
    });
});
accountRoute.get('/feedback', restrict, function(req, res) {
    var curUser = res.locals.layoutModels.curUser;
    feedback.loadByReceiverID(curUser.id).then(function(rows){
        var promise = [];
        var box = [];
        if(rows)
        {
            rows.forEach( function(element, index) {
                var temp = {
                    product: 'Chưa tìm',
                    sender: 'Chưa tìm',
                    note: element.Note,
                    isPlus: element.Score == 1,
                    isMinus: element.Score == -1
                }
                box.push(temp);
                promise.push(product.loadDetail(element.ProID));
                promise.push(account.load(element.SenderID));
            });
        }

        Q.all(promise).done(function(rs){
            var k = 0;
            box.forEach( function(element, index) {
                element.product = rs[k];
                element.sender = rs[k + 1];
                k += 2;
            });
            res.render('account/feedback', {
                layoutModels: res.locals.layoutModels,
                box: box,
                isEmpty: box.length == 0,
                canAuction: curUser.score >= 0.8,
                percentScore: curUser.score*100,
            });
        });
    });
});

accountRoute.get('/reqUpAccount', restrict, function(req, res){
    request.insert(res.locals.layoutModels.curUser.id).then(function(insertId){
        req.session.numberOfRequests = res.locals.layoutModels.numberOfRequests + 1;
        res.redirect("/account/profile/" + res.locals.layoutModels.curUser.id);
    });
});

module.exports = accountRoute;