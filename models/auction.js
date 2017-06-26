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

exports.deleteByUserID = function(id) {

    var deferred = Q.defer();

    var sql =
        mustache.render(
            'delete from auctions where UserID = ' + id,
            entity
        );

    db.delete(sql).then(function(affectedRows) {
        deferred.resolve(affectedRows);
    });

    return deferred.promise;
}

exports.deleteByProID = function(id) {

    var deferred = Q.defer();

    var sql =
        mustache.render(
            'delete from auctions where ProID = ' + id,
            entity
        );

    db.delete(sql).then(function(affectedRows) {
        deferred.resolve(affectedRows);
    });

    return deferred.promise;
}

exports.findHandlePrice = function(ProID) {

    var deferred = Q.defer();

    var sql =
            'select * from users, (select UserID, Price from auctions WHERE ProID = ' + ProID + ' GROUP BY '
             + 'ProID HAVING Price = MAX(Price)) as temp where ID = temp.UserID ';

    db.load(sql).then(function(rows) {
        deferred.resolve(rows[0].UserID);
    });

    return deferred.promise;
}