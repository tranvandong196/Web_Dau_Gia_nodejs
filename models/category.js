var Q = require('q');
var mustache = require('mustache');
var db = require('../app-helpers/dbHelper');

exports.loadAll = function() {

    var deferred = Q.defer();
    
    var sql = 'select * from categories';
    db.load(sql).then(function(rows) {
        deferred.resolve(rows);
    });

    return deferred.promise;
}

exports.load = function(id) {

    var deferred = Q.defer();
    
    var sql = 'select * from categories where CatID = ' + id;
    db.load(sql).then(function(rows) {
        deferred.resolve(rows[0]);
    });

    return deferred.promise;
}

exports.delete = function(id) {

    var deferred = Q.defer();
    var sql = 'delete from categories where CatID = ' + id;
    var sql1 = 'delete from products where CatID = ' + id;
    Q.all([
    	db.delete(sql), db.delete(sql1),
    ]).done(function(affectedRows, affectedRows1){
    	deferred.resolve(affectedRows);
    });
    return deferred.promise;
}

exports.insert = function(entity) {

    var deferred = Q.defer();
    
    var sql = mustache.render(
    	'insert into categories (CatName) values ("{{catName}}")',
     entity
     );
    db.insert(sql).then(function(insertId) {
        deferred.resolve(insertId);
    });

    return deferred.promise;
}

exports.update = function(entity) {

    var deferred = Q.defer();
    
    var sql = mustache.render(
    	'update categories set CatName = "{{catName}}" where CatID = {{catID}}',
     	entity
     );
    db.insert(sql).then(function(changedRows) {
        deferred.resolve(changedRows);
    });

    return deferred.promise;
}

exports.findIdByName = function(name) {

    var deferred = Q.defer();
    
    var sql = 'select CatID from categories where CatName = "' + name + '"';
    db.load(sql).then(function(rows) {
        deferred.resolve(rows[0]);
    });

    return deferred.promise;
}