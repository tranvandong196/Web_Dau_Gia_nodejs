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
                    var hour = 1000 * 60 * 60 * 24;
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
    req.session.user = null;
    req.session.cart = null;
    req.session.cookie.expires = new Date(Date.now() - 1000);
    res.redirect(req.headers.referer);
});

accountRoute.get('/register', function(req, res) {
    // account.loadAll()
    // .then(function(rows){
    //     res.render('account/register', {
    //     layoutModels: res.locals.layoutModels,
    //     showMsg: false,
    //     error: false,
    //     msg: '',
    //     users: rows,
    // });
    // });
    res.render('account/register', {
        layoutModels: res.locals.layoutModels,
        showMsg: false,
        error: false,
        msg: '',
    });
});

accountRoute.post('/register', function(req, res) {

    var ePWD = crypto.createHash('md5').update(req.body.rawPWD).digest('hex');
    var nDOB = moment(req.body.dob, 'D/M/YYYY').format('YYYY-MM-DDTHH:mm');
    

    var entity = {
        username: req.body.username,
        password: ePWD,
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        dob: nDOB,
        permission: 0,
        scorePlus: 0,
        scoreMinus: 0,
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

accountRoute.get('/profile', restrict, function(req, res) {
    res.render('account/profile', {
        layoutModels: res.locals.layoutModels
    });
});

accountRoute.get('/changePassword', restrict, function(req, res) {
    res.render('account/changePassword', {
        layoutModels: res.locals.layoutModels
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
       res.render('account/manageRequests', {
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