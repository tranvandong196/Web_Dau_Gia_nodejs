var Q = require('q');
var mustache = require('mustache');

var db = require('../app-helpers/dbHelper');

exports.insert = function(entity) {

    var deferred = Q.defer();

    var sql =
        mustache.render(
            'insert into users (f_Username, f_Password, f_Name, f_Email, f_DOB, f_Permission) values ("{{username}}", "{{password}}", "{{name}}", "{{email}}", "{{dob}}", {{permission}})',
            entity
        );

    db.insert(sql).then(function(insertId) {
        deferred.resolve(insertId);
    });

    return deferred.promise;
}

exports.login = function(entity) {

    var deferred = Q.defer();

    var sql =
        mustache.render(
            'select * from users where f_Username = "{{username}}" and f_Password = "{{password}}"',
            entity
        );

    db.load(sql).then(function(rows) {
        if (rows.length > 0) {
            var user = {
                id: rows[0].f_ID,
                username: rows[0].f_Username,
                name: rows[0].f_Name,
                email: rows[0].f_Email,
                dob: rows[0].f_DOB,
                permission: rows[0].f_Permission
            }
            deferred.resolve(user);
        } else {
            deferred.resolve(null);
        }
    });

    return deferred.promise;
}