var Q = require('q');
var mustache = require('mustache');
var db = require('../app-helpers/dbHelper');
var fs = require('fs');

exports.loadPageByCat = function(id, limit, offset) {

    var deferred = Q.defer();

    var promises = [];

    var view = {
        id: id,
        limit: limit,
        offset: offset
    };

    var sqlCount = mustache.render('select count(*) as total from products where CatID = {{id}}', view);
    promises.push(db.load(sqlCount));

    var sql = mustache.render('select * from products where CatID = {{id}} limit {{limit}} offset {{offset}}', view);
    promises.push(db.load(sql));

    Q.all(promises).spread(function(totalRow, rows) {
        var data = {
            total: totalRow[0].total,
            list: rows
        }
        deferred.resolve(data);
    });

    return deferred.promise;
}

exports.loadAllByCat = function(id) {

    var deferred = Q.defer();

    var sql = 'select * from products where CatID = ' + id;
    db.load(sql).then(function(rows) {
        deferred.resolve(rows);
    });

    return deferred.promise;
}

exports.loadDetail = function(id) {

    var deferred = Q.defer();

    var sql = 'select * from products where ProID = ' + id;
    db.load(sql).then(function(rows) {
        if (rows) {
            deferred.resolve(rows[0]);
        } else {
            deferred.resolve(null);
        }
    });

    return deferred.promise;
}

exports.loadTop5OfAuction = function() {

    var deferred = Q.defer();

    var sql = 'SELECT products.*, COUNT(*) as SoLuong FROM products INNER JOIN auctions on products.ProID = auctions.ProID GROUP BY auctions.ProID ORDER BY COUNT(*) DESC';
    db.load(sql).then(function(rows) {
        if (rows) {
            deferred.resolve(rows);
        } else {
            deferred.resolve(null);
        }
    });

    return deferred.promise;
}

exports.loadTop5OfPrice = function() {

    var deferred = Q.defer();

    var sql = 'SELECT * FROM products ORDER BY Price DESC LIMIT 5';
    db.load(sql).then(function(rows) {
        if (rows) {
            deferred.resolve(rows);
        } else {
            deferred.resolve(null);
        }
    });

    return deferred.promise;
}

exports.loadTop5OfTimeDown = function() {

    var deferred = Q.defer();

    var sql = 'SELECT * FROM products ORDER BY TimeDown ASC LIMIT 5';
    db.load(sql).then(function(rows) {
        if (rows) {
            deferred.resolve(rows);
        } else {
            deferred.resolve(null);
        }
    });

    return deferred.promise;
}
exports.insert = function(entity) {

    var deferred = Q.defer();

    var sql = mustache.render(
        'insert into products (ProName, TinyDes, FullDes, Price, CatID, Quantity, PriceToBuy, UserID, HandleID, TimeUp, TimeDown, DeltaPrice) values ("{{proName}}", "{{tinyDes}}", "{{fullDes}}",{{price}}, {{catID}}, {{quantity}}, {{priceToBuy}}, {{userID}}, {{handleID}}, "{{timeUp}}", "{{timeDown}}", {{deltaPrice}})',
        entity        
        );
    db.insert(sql).then(function(insertId) {
        deferred.resolve(insertId);
    });

    return deferred.promise;
}

exports.deleteByCat = function(id) {

    var deferred = Q.defer();

    var sql = 'delete from products where CatID = ' + id;

    db.delete(sql).then(function(affectedRows) {
        deferred.resolve(insertId);
    });
    return deferred.promise;
}

exports.loadAllByFavorite = function(userid) {

    var deferred = Q.defer();

    var sql = 'SELECT * FROM products WHERE ProID IN (SELECT ProID From favorites WHERE UserID = ' + userid + ')';
    db.load(sql).then(function(rows) {
        console.log("So luong san pham: " + rows.length)
        deferred.resolve(rows);
    });
    console.log(sql)
    return deferred.promise;
}
exports.loadPageByFavorite = function(userid, limit, offset) {

    var deferred = Q.defer();

    var promises = [];

    var view = {
        userid: userid,
        limit: limit,
        offset: offset
    };

    var sqlCount = mustache.render('SELECT COUNT(*) as total FROM products WHERE ProID IN (SELECT ProID From favorites WHERE UserID = {{userid}})', view);
    promises.push(db.load(sqlCount));

    var sql = mustache.render('SELECT * FROM products WHERE ProID IN (SELECT ProID From favorites WHERE UserID = {{userid}}) limit {{limit}} offset {{offset}}', view);
    promises.push(db.load(sql));

    Q.all(promises).spread(function(totalRow, rows) {
        var data = {
            total: totalRow[0].total,
            list: rows
        }
        console.log("[Product] Da lay danh sach yeu thich userID: " + userid + ", SoLuong = " + rows.length)
        deferred.resolve(data);
    });
    
    return deferred.promise;
}

exports.loadPageByAuction = function(userid, limit, offset) {

    var deferred = Q.defer();

    var promises = [];

    var view = {
        userid: userid,
        limit: limit,
        offset: offset
    };

    var sqlCount = mustache.render('SELECT COUNT(*) as total FROM products WHERE ProID IN (SELECT ProID From auctions WHERE UserID = {{userid}} GROUP BY UserID) AND NOW() < TimeDown', view);
    promises.push(db.load(sqlCount));

    var sql = mustache.render('SELECT * FROM products WHERE ProID IN (SELECT ProID From auctions WHERE UserID = {{userid}} GROUP BY UserID) AND NOW() < TimeDown limit {{limit}} offset {{offset}}', view);
    promises.push(db.load(sql));

    Q.all(promises).spread(function(totalRow, rows) {
        var data = {
            total: totalRow[0].total,
            list: rows
        }
        console.log("[Product] Da lay danh sach dang dau gia userID: " + userid + ", SoLuong = " + rows.length)
        deferred.resolve(data);
    });
    
    return deferred.promise;
}
// exports.makeCartItem = function(id, q) {

//     var deferred = Q.defer();

//     var sql = 'select * from products where ProID = ' + id;
//     db.load(sql).then(function(rows) {
//         if (rows) {
//             var ret = {
//                 Product: rows[0],
//                 Quantity: q,
//                 Amount: rows[0].Price * q
//             }
//             deferred.resolve(ret);
//         } else {
//             deferred.resolve(null);
//         }
//     });

//     return deferred.promise;
// }

exports.search = function(entity){
    var deferred = Q.defer();

    var text = entity.text;
    var findBy = entity.findBy;
    var arrange = entity.arrange;
    var sql;

    if(findBy === 'Tìm theo danh mục')
    {
        findBy = mustache.render('where CatID in (select CatID from categories where CatName like "%{{text}}%")', entity);
    }
    else if(findBy === 'Tìm theo tên sản phẩm')
    {
        findBy = mustache.render('where ProName like "%{{text}}%"', entity);
    }
    else if(findBy === 'Tất cả')
    {
        findBy = mustache.render('where CatID in (select CatID from categories where CatName like "%{{text}}%") or ProName like "%{{text}}%"', entity);
    }

    sql = mustache.render('select * from products ' + findBy + ' order by ', entity);
    if(arrange === 'Thời gian hết hạn tăng')
    {
        sql = sql + 'TimeDown asc';
    }
    else if(arrange === 'Thời gian hết hạn giảm')
    {
        sql = sql + 'TimeDown desc';
    }
    else if(arrange === 'Giá tăng dần')
    {
        sql = sql + 'Price asc';
    }
    else if(arrange === 'Giá giảm dần')
    {
        sql = sql + 'Price desc';
    }
    db.load(sql).then(function(rows){
        deferred.resolve(rows);
    })

    return deferred.promise;
}