var Q = require('q');
var mustache = require('mustache');

var db = require('../app-helpers/dbHelper');

exports.insert = function(entity) {

    var deferred = Q.defer();

    var sql =
        mustache.render(
            'insert into favorites (UserID, ProID) values ({{userID}}, {{proID}})',
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

exports.deleteByUserID = function(id) {

    var deferred = Q.defer();

    var sql = 'delete from favorites where UserID = ' + id;

    db.delete(sql).then(function(affectedRows) {
        deferred.resolve(affectedRows);
    });

    return deferred.promise;
}

exports.isLoved = function(entity) {

    var deferred = Q.defer();

    var sql =
        mustache.render(
            'select * from favorites where ProID = {{proID}} && UserID = {{userID}}',
            entity
        );
    db.load(sql).then(function(rows){
        if(rows[0])
        {
            deferred.resolve(true);
        }
        else
        {
            deferred.resolve(false);

        }
    });
    return deferred.promise;
}

exports.deleteByProID = function(id) {

    var deferred = Q.defer();

    var sql = 'delete from favorites where ProID = ' + id;

    db.delete(sql).then(function(affectedRows) {
        deferred.resolve(affectedRows);
    });

    return deferred.promise;
}