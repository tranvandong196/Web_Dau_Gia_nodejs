var Q = require('q');
var mustache = require('mustache');

var db = require('../app-helpers/dbHelper');

exports.insert = function(id) {

    var deferred = Q.defer();
    var sqlLoad = 'select * from requests where UserID = ' + id;
    db.load(sqlLoad).then(function(rows) {
        if(rows.length == 0)
        {
            var sql = 'insert into requests (UserID) values(' + id + ')';
            db.insert(sql).then(function(insertId) {
                deferred.resolve(insertId);
            });
        }
    });
    

    return deferred.promise;
}

exports.delete = function(id) {

    var deferred = Q.defer();

    var sql = 'delete from requests where UserID = ' + id;


    db.delete(sql).then(function(affectedRows) {
        deferred.resolve(affectedRows);
    });

    return deferred.promise;
}

exports.loadAll= function() {

    var deferred = Q.defer();

    var sql = 'select * from requests';
    db.load(sql).then(function(rows) {
        if(rows)
            deferred.resolve(rows);
        else
            deferred.resolve(null);
    });

    return deferred.promise;
}

exports.loadByID= function(id) {

    var deferred = Q.defer();

    var sql = 'select * from requests where UserID = ' + id;
    db.load(sql).then(function(rows) {
        if(rows)
        {
            if(rows[0])
            {
                deferred.resolve(rows[0]);
            }
            else
            {
                deferred.resolve(null);
            }
        }
        else
            deferred.resolve(null);
    });

    return deferred.promise;
}