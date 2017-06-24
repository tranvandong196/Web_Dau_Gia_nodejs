var Q = require('q');
var mustache = require('mustache');

var db = require('../app-helpers/dbHelper');

exports.insert = function(entity) {

    var deferred = Q.defer();

    var sql =
        mustache.render(
            'insert into auctions (UserID, ProID) values ({{userID}}, {{proID}})',
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
            'delete from favorites where UserID = ' + id;
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
            'delete from favorites where ProID = ' + id;
            entity
        );

    db.delete(sql).then(function(affectedRows) {
        deferred.resolve(affectedRows);
    });

    return deferred.promise;
}