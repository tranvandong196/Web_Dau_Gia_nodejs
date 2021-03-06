var Q = require('q');
var mustache = require('mustache');

var db = require('../app-helpers/dbHelper');

exports.insert = function(entity) {

    var deferred = Q.defer();

    var sql =
        mustache.render(
            'insert into auctions (Date, Price, UserID, ProID) values ("{{date}}", {{price}}, {{userID}}, {{proID}})',
            entity
        );

    db.insert(sql).then(function(insertId) {
        deferred.resolve(insertId);
    });

    return deferred.promise;
}

exports.deleteAuctorFromProduct = function(entity) {

    var deferred = Q.defer();

    var sql =
        mustache.render(
            'delete from auctions where UserID = {{auctorID}} && ProID = {{proID}}',
            entity
        );

    db.delete(sql).then(function(affectedRows) {
        deferred.resolve(affectedRows);
    });

    return deferred.promise;
}

// exports.deleteByUserID = function(id) {

//     var deferred = Q.defer();

//     var sql =
//         mustache.render(
//             'delete from auctions where UserID = ' + id,
//             entity
//         );

//     db.delete(sql).then(function(affectedRows) {
//         deferred.resolve(affectedRows);
//     });

//     return deferred.promise;
// }

// exports.deleteByProID = function(id) {

//     var deferred = Q.defer();

//     var sql =
//         mustache.render(
//             'delete from auctions where ProID = ' + id,
//             entity
//         );

//     db.delete(sql).then(function(affectedRows) {
//         deferred.resolve(affectedRows);
//     });

//     return deferred.promise;
// }

exports.findHandlePrice = function(ProID) {

    var deferred = Q.defer();

    var sql =
            'select * from users where ID in (select UserID from auctions where ProID = ' + ProID 
            + ' and Price = (select MAX(Price) from auctions where ProID = ' + ProID + '))';
    db.load(sql).then(function(rows) {
        if(rows[0])
            deferred.resolve(rows[0]);
        else
            deferred.resolve(null);
    });

    return deferred.promise;
}

exports.findMaxPrice = function(ProID) {

    var deferred = Q.defer();

    var sql =
            'select Max(Price) as MaxPrice from auctions where ProID = ' + ProID;

    db.load(sql).then(function(rows) {
        if(rows[0])
            deferred.resolve(rows[0].MaxPrice);
        else
            deferred.resolve(null); 
    });
    return deferred.promise;
}

exports.loadAllAuctorByProID = function(ProID) {

    var deferred = Q.defer();

    var sql =
            'select * from users where ID in (select UserID from auctions where ProID = ' + ProID + ')';

    db.load(sql).then(function(rows) {
        if(rows)
            deferred.resolve(rows);
        else
            deferred.resolve(null); 
    });
    return deferred.promise;
}

exports.loadAllAuctionByProID = function(ProID) {

    var deferred = Q.defer();

    var sql =
            'select * from auctions where ProID = ' + ProID;

    db.load(sql).then(function(rows) {
        if(rows)
            deferred.resolve(rows);
        else
            deferred.resolve(null); 
    });
    return deferred.promise;
}