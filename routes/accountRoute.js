var express = require('express');
var crypto = require('crypto');
var moment = require('moment');
var category = require('../models/category');
var restrict = require('../middle-wares/restrict');
var account = require('../models/account');

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
                req.session.isLogged = true;
                req.session.isAdmin = (user.permission === 1);
                req.session.user = user;
                req.session.cart = [];

                if (remember === true) {
                    var hour = 1000 * 60 * 60 * 24 * 7;
                    req.session.cookie.expires = new Date(Date.now() + hour);
                    req.session.cookie.maxAge = hour;
                }

                var url = '/home';
                if (req.query.retUrl) {
                    url = req.query.retUrl;
                }
                res.redirect(url);
            }
        });
});

accountRoute.post('/logout', restrict, function(req, res) {
    req.session.isLogged = false;
    req.session.isAdmin = false;
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
                res.render('account/register', {
                    layoutModels: res.locals.layoutModels,
                    showMsg: true,
                    error: false,
                    msg: 'Đăng ký thành công.',
        });
    });
});

accountRoute.get('/profile/:id', restrict, function(req, res) {
    account.load(req.params.id).then(function(user){
        if(user)
        {
            user.DOB = moment(user.DOB).format('l');
            res.render('account/profile', {
                layoutModels: res.locals.layoutModels,
                percentScore: user.Score*100,
                canAuction: user.Score >= 0.8,
                user: user,
                isMyProfile: user.ID === res.locals.layoutModels.curUser.id,
                isTrashAccount: user === null,
            });
        }
        else
        {
            res.render('account/profile', {
                layoutModels: res.locals.layoutModels,
                percentScore: 0,
                canAuction: false,
                user: user,
                isMyProfile: false,
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
    var entity = {
        id: res.locals.layoutModels.curUser.id,
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        dOB: nDOB,
        password: res.locals.layoutModels.curUser.password,
        username: res.locals.layoutModels.curUser.username,
    };
    account.changeProfile(entity)
    .then(function(rs) {
        if(rs === -2)
        {
            res.render('account/profile', {
                layoutModels: res.locals.layoutModels,
                showMsg: true,
                error: true,
                msg: 'Email này đã có người sử dụng.',
            });
        }
        else if(rs === -1)
        {
            res.render('account/profile', {
                layoutModels: res.locals.layoutModels,
                showMsg: true,
                error: true,
                msg: 'Địa chỉ này đã có người sử dụng.',
            });
        }
        else
        {
            account.login(entity).then(function(user){
                res.locals.layoutModels.curUser = user;
                req.session.user = user;

                res.render('account/profile', {
                    layoutModels: res.locals.layoutModels,
                    showMsg: true,
                    error: false,
                    msg: 'Thông tin đã được thay đổi.',
                });
            })
        }
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
    category.loadAll().then(function(rows){
        res.render('account/manageRequests', {
        layoutModels: res.locals.layoutModels,
        categories: rows,
        showMsg: false,
        error: false,
        msg: '',
    });
    });
});

accountRoute.get('/resetPW/:id', restrict, function(req, res) {
    var id = req.params.id;
    account.resetPW(id).then(function(changedRows){
        res.redirect('/account/manageUsers');
    });
});

module.exports = accountRoute;