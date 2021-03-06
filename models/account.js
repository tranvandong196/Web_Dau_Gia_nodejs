var Q = require('q');
var mustache = require('mustache');
var crypto = require('crypto');
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
                'insert into users (Username, Password, Name, Email, DOB, Permission, ScorePlus, ScoreMinus, Score, Address) values ("{{username}}", '
                + '"{{password}}", "{{name}}", "{{email}}", "{{dOB}}", {{permission}}, {{scorePlus}}, {{scoreMinus}}, {{score}}, "{{address}}")',
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
                score: rows[0].Score,
                dOB: rows[0].DOB,
                permission: rows[0].Permission,
                password: rows[0].Password,
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

exports.load = function(id) {

    var deferred = Q.defer();

    var sql = 'select * from users where ID = ' + id;

    db.load(sql).then(function(rows) {
        if (rows) {
            deferred.resolve(rows[0]);
        } else {
            deferred.resolve(null);
        }
    });

    return deferred.promise;
}

// score là 1 hoặc là -1
exports.updateScore = function(id, score, oldScore){
    var deferred = Q.defer();

    var sql = 'select * from users where ID = ' + id;
    var plus = 1;
    var minus = 1;
    db.load(sql).then(function(rows) {
        if (rows[0]) {
            plus = rows[0].ScorePlus;
            minus = rows[0].ScoreMinus;
        }
        if(score == 1)
        {
            if(oldScore == -1)
            {
                plus = plus + 1;
                minus = minus - 1;
            }
            else
            {
                plus = plus + 1;
            }
            sql = 'update users set ScorePlus = ' + plus + ', ScoreMinus = ' + minus + ' where ID = ' + id;
        }
        else
        {
           if(oldScore == 1)
            {
                plus = plus - 1;
                minus = minus + 1;
            }
            else
            {
                minus = minus + 1;
            }
            sql = 'update users set ScorePlus = ' + plus + ', ScoreMinus = ' + minus + ' where ID = ' + id;
        }
        db.update(sql).then(function(changedRows){
            var score = parseFloat(plus) / parseFloat(plus + minus);
            score = score.toFixed(2);
            sql = 'update users set Score = ' + score + ' where ID = ' + id;
            db.update(sql).then(function(changedRows){
                deferred.resolve(changedRows);
            });
            
        });
    });
    

    return deferred.promise;
}

exports.delete = function(id){
    var deferred = Q.defer();

    var sql = 'delete from users where ID = ' + id;
    var sql1 = 'delete from products where UserID = ' + id;
    Q.all([
        db.delete(sql), db.delete(sql1),
    ]).done(function(affectedRows, affectedRows1){
        deferred.resolve(affectedRows);
    });
    return deferred.promise;
}

exports.resetPW = function(id){
    var deferred = Q.defer();
    var ePWD = crypto.createHash('md5').update('123456').digest('hex');
    var entity = {
        pw: ePWD,
        id: id,
    };
    var sql = mustache.render('update users set Password = "{{pw}}" where ID = {{id}}', entity);
    Q.all([
        db.update(sql),
    ]).done(function(changedRows){
        deferred.resolve(changedRows);
    });
    return deferred.promise;
}

exports.changeProfile = function(entity){
    var deferred = Q.defer();
    var sql = mustache.render('select * from users where ID != {{id}}', entity);
    db.load(sql).then(function(rows)
    {
        var email = mustache.render('{{email}}', entity);
        var address = mustache.render('{{address}}', entity);
        for (var i = 0; i < rows.length; i++) {
            if(rows[i].Email === email)
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
                'update users set Name = "{{name}}", Email = "{{email}}", DOB = "{{dOB}}", Address = "{{address}}" where ID = {{id}}',
                entity
            );

        db.update(sql).then(function(changedRows) {
            deferred.resolve(changedRows);
        });
    });
    return deferred.promise;
}

exports.changePassword = function(entity){
    var deferred = Q.defer();
    var sql = 'select * from users where ID = ' + entity.id;
    db.load(sql).then(function(rows)
    {
        var password = entity.password;
        if(rows[0].Password !== password)
            {
                deferred.resolve(-1);
                return;
            }
        sql =
            mustache.render(
                'update users set Password = "{{newPW}}" where ID = {{id}}',
                entity
            );

        db.update(sql).then(function(changedRows) {
            deferred.resolve(changedRows);
        });
    });

    return deferred.promise;
}

exports.updateAccToSeller = function(id){
    var deferred = Q.defer();
    var sql = 'update users set Permission = 1 where ID = ' + id;
    db.update(sql).then(function(changedRows)
    {
        deferred.resolve(changedRows);
    });

    return deferred.promise;
}

exports.updateAccToAdminator = function(id){
    var deferred = Q.defer();
    var sql = 'update users set Permission = 2 where ID = ' + id;
    db.update(sql).then(function(changedRows)
    {
        deferred.resolve(changedRows);
    });

    return deferred.promise;
}