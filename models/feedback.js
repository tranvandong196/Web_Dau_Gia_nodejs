var Q = require('q');
var mustache = require('mustache');

var db = require('../app-helpers/dbHelper');

exports.insert = function(entity, oldScore) {

    var deferred = Q.defer();
    var sql;
    if(oldScore == -2)
    {
        sql =
            mustache.render(
                'insert into feedbacks (ProID, ReceiverID, SenderID, Score) values ({{proID}}, {{receiverID}}, {{senderID}}, {{score}})',
                entity
            );
        db.insert(sql).then(function(rs)
        {
            deferred.resolve(rs);
        });
    }
    else
    {
        sql =
            mustache.render(
                'update feedbacks set Score = {{score}} where ProID = {{proID}} and ReceiverID = {{receiverID}} and SenderID = {{senderID}}',
                entity
            );
        db.update(sql).then(function(rs)
        {
            deferred.resolve(rs);
        });
    }
    return deferred.promise;
}

exports.updateComment = function(entity) {

    var deferred = Q.defer();

    var sql =
        mustache.render(
            'update feedbacks set Note = "{{comment}}" where ProID = {{proID}} and ReceiverID = {{receiverID}} and SenderID = {{senderID}}',
            entity
        );

    db.update(sql).then(function(changedRows){
        deferred.resolve(changedRows);
    });
    return deferred.promise;
}

exports.insertComment = function(entity) {

    var deferred = Q.defer();

    var sql =
        mustache.render(
            'insert into feedbacks (ProID, ReceiverID, SenderID, Note) values ({{proID}}, {{receiverID}}, {{senderID}}, "{{comment}}")',
            entity
        );

    db.insert(sql).then(function(insertId){
        deferred.resolve(insertId);
    });
    return deferred.promise;
}

exports.isGaveScore = function(entity){
    var deferred = Q.defer();
    var sql =
        mustache.render(
            'select * from feedbacks where ProID = {{proID}} and ReceiverID = {{receiverID}} and SenderID = {{senderID}}',
            entity
        );
   db.load(sql).then(function(rows){
        if(!rows)
        {
            deferred.resolve(-2);
        }
        else if(rows.length > 0)
        {
            if(rows[0].Score)
                deferred.resolve(rows[0].Score);
            else
                deferred.resolve(0);
        }
        else
        {
            deferred.resolve(-2);
        }
   });
    return deferred.promise;
}

exports.isGaveComment = function(entity){
    var deferred = Q.defer();
    var sql =
        mustache.render(
            'select * from feedbacks where ProID = {{proID}} and ReceiverID = {{receiverID}} and SenderID = {{senderID}}',
            entity
        );
   db.load(sql).then(function(rows){
        if(!rows)
        {
            deferred.resolve(false);
        }
        else if(rows.length > 0)
        {
            if(rows[0].Note != null)
                deferred.resolve(true);
            else
                deferred.resolve(false);
        }
        else
        {
            deferred.resolve(false);
        }
   });
    return deferred.promise;
}

exports.loadByReceiverID = function(recID){
    var deferred = Q.defer();
    var sql = 'select * from feedbacks where ReceiverID = ' + recID;
    db.load(sql).then(function(rows){
        if(!rows)
        {
            deferred.resolve(null);
        }
        else {
            deferred.resolve(rows);
        }
    });
    return deferred.promise;
}