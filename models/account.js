var Q = require('q');
var mustache = require('mustache');

var db = require('../app-helpers/dbHelper');

exports.insert = function(entity) {

    var deferred = Q.defer();
    var insertId = -1;
    var sql = 'select * from users';
    db.load(sql).then(function(rows)
    {
        var username = mustache.render('{{username}}', entity);
        var email = mustache.render('{{email}}', entity);
        var address = mustache.render('{{address}}', entity);
        for (var i = 0; i < rows.length; i++) {
            if(rows[i].Username === username)
            {
                deferred.resolve(-3);
                return;
            }
            else if(rows[i].Email === email)
                {
                    deferred.resolve(-2);
                    return;
                }
                else if(rows[i].Address === address)
                    {
                        deferred.resolve(-1);
                        return;
                    }
        }
        sql =
            mustache.render(
                'insert into users (Username, Password, Name, Email, DOB, Permission, Score, Address) values ("{{username}}", "{{password}}", "{{name}}", "{{email}}", "{{dob}}", {{permission}}, {{score}}, "{{address}}")',
                entity
            );

        db.insert(sql).then(function(insertId) {
            deferred.resolve(insertId);
        });
    });
    return deferred.promise;
}

exports.login = function(entity) {

    var deferred = Q.defer();

    var sql =
        mustache.render(
            'select * from users where Username = "{{username}}" and Password = "{{password}}"',
            entity
        );

    db.load(sql).then(function(rows) {
        if (rows.length > 0) {
            var user = {
                id: rows[0].ID,
                username: rows[0].Username,
                name: rows[0].Name,
                email: rows[0].Email,
                address: rows[0].Address,
                score: rows[0].Score,
                dob: rows[0].DOB,
                permission: rows[0].Permission
            }
            deferred.resolve(user);
        } else {
            deferred.resolve(null);
        }
    });

    return deferred.promise;
}

exports.loadAll = function() {

    var deferred = Q.defer();

    var sql = 'select * from users';

    db.load(sql).then(function(rows) {
        if (rows) {
            deferred.resolve(rows);
        } else {
            deferred.resolve(null);
        }
    });

    return deferred.promise;
}