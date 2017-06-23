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
                'insert into users (Username, Password, Name, Email, DOB, Permission, ScorePlus, ScoreMinus, Address) values ("{{username}}", "{{password}}", "{{name}}", "{{email}}", "{{dob}}", {{permission}}, {{scorePlus}}, {{scoreMinus}}, "{{address}}")',
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
                scorePlus: rows[0].ScorePlus,
                scoreMinus: rows[0].ScoreMinus,
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

exports.getScore = function(id){
    var deferred = Q.defer();

    var sql = 'select * from users where ID = ' + id;

    db.load(sql).then(function(rows) {
        if (rows) {
            deferred.resolve(rows[0].ScorePlus/(rows[0].ScorePlus + rows[0].Score));
        } else {
            deferred.resolve(null);
        }
    });

    return deferred.promise;
}

exports.updateScore = function(id, score){
    var deferred = Q.defer();

    var sql = 'select Score from users where ID = ' + id;
    var plus;
    var minus;
    db.load(sql).then(function(rows) {
        if (rows[0]) {
            plus = rows[0].ScorePlus + 1;
            minus = rows[0].ScoreMinus + 1;
        } else {
            score = 0;
        }
    });
    var sql;
    if(score === 1)
    {
        sql = mustache.render(
            'update users set SocrePlus = {{plus}}',
            plus
            );
    }
    else
    {
        sql = mustache.render(
            'update users set SocreMinus = {{minus}}',
            minus
            );
    }
     db.update(sql).then(function(changedRows){
        deferred.resolve(changedRows);
        });

    return deferred.promise;
}