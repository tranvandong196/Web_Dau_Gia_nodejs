var Q = require('q');
var mustache = require('mustache');

var db = require('../app-helpers/dbHelper');

exports.insert = function(entity) {

    var deferred = Q.defer();

    var sql =
        mustache.render(
            'insert into blacklists (ProID, AuctorID) values ({{proID}}, {{auctorID}})',
            entity
        );

    db.insert(sql).then(function(insertId) {
        deferred.resolve(insertId);
    });

    return deferred.promise;
}

exports.delete = function(entity) {

    var deferred = Q.defer();

    var sql =
        mustache.render(
            'delete from favorites where ProID = {{proID}} && UserID = {{userID}}',
            entity
        );

    db.insert(sql).then(function(insertId) {
        deferred.resolve(insertId);
    });

    return deferred.promise;
}

exports.loadByProID = function(id) {

    var deferred = Q.defer();

    var sql = 'select * from blacklists where ProID = ' + id;

    db.load(sql).then(function(rows) {
        if(rows)
            deferred.resolve(rows);
        else
            deferred.resolve(null);
    });

    return deferred.promise;
}