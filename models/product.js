var Q = require('q');
var mustache = require('mustache');
var db = require('../app-helpers/dbHelper');

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
    console.log(sql);
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

exports.findbyName = function(entity) {

    var deferred = Q.defer();
    var sql = mustache.render(
        'SELECT * FROM products where ProName LIKE "%{{search}}%"',
        entity        
        );

    db.load(sql).then(function(rows) {
        if (rows) {
            deferred.resolve(rows);
        } else {
            deferred.resolve(null);
        }
    });
    
    return deferred.promise;
}

exports.findbyCat = function(entity) {

    var deferred = Q.defer();
    var sql = mustache.render(
        'SELECT CatID FROM categories where CatName LIKE "%{{search}}%"',
        entity        
        );  
    
    db.load(sql).then(function(rows) {
        if (rows) {
            deferred.resolve(rows);
        } else {
         deferred.resolve(null);
     }
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