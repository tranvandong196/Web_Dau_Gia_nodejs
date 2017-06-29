var Q = require('q');
var mustache = require('mustache');
var db = require('../app-helpers/dbHelper');
var fs = require('fs');
var moment = require('moment');

exports.loadPageByCat = function(id, limit, offset) {

    var deferred = Q.defer();

    var promises = [];

    var view = {
        id: id,
        limit: limit,
        offset: offset
    };

    var sqlCount = mustache.render('select count(*) as total from products where CatID = {{id}}', view);
    promises.push(db.load(sqlCount));

    var sql = mustache.render('select * from products where CatID = {{id}} limit {{limit}} offset {{offset}}', view);
    promises.push(db.load(sql));

    Q.all(promises).spread(function(totalRow, rows) {
        var data = {
            total: totalRow[0].total,
            list: rows
        }
        deferred.resolve(data);
    });

    return deferred.promise;
}

exports.loadAllByCat = function(id) {

    var deferred = Q.defer();

    var sql = 'select * from products where CatID = ' + id;
    db.load(sql).then(function(rows) {
        deferred.resolve(rows);
    });

    return deferred.promise;
}

exports.loadDetail = function(id) {

    var deferred = Q.defer();

    var sql = 'select * from products where ProID = ' + id;
    db.load(sql).then(function(rows) {
        if (rows) {
            deferred.resolve(rows[0]);
        } else {
            deferred.resolve(null);
        }
    });
    return deferred.promise;
}

exports.loadTop5OfAuction = function() {

    var deferred = Q.defer();

    var sql = 'SELECT products.*, COUNT(*) as SoLuong FROM products INNER JOIN auctions on products.ProID = auctions.ProID GROUP BY auctions.ProID ORDER BY COUNT(*) DESC limit 5';
    db.load(sql).then(function(rows) {
        if (rows) {
            deferred.resolve(rows);
        } else {
            deferred.resolve(null);
        }
    });

    return deferred.promise;
}

exports.loadTop5OfPrice = function() {

    var deferred = Q.defer();

    var sql = 'SELECT * FROM products where State = "đang đấu giá" ORDER BY Price DESC LIMIT 5';
    db.load(sql).then(function(rows) {
        if (rows) {
            deferred.resolve(rows);
        } else {
            deferred.resolve(null);
        }
    });

    return deferred.promise;
}

exports.loadTop5OfTimeDown = function() {

    var deferred = Q.defer();

    var sql = 'SELECT * FROM products ORDER BY TimeDown ASC LIMIT 5';
    db.load(sql).then(function(rows) {
        if (rows) {
            rows.forEach( function(element, index) {
                element.TimeDown = moment(element.TimeDown, "YYYY-MM-DD HH:mm:ss").fromNow();
            });
            deferred.resolve(rows);
        } else {
            deferred.resolve(null);
        }
    });

    return deferred.promise;
}
exports.insert = function(entity) {
    var sql;
    var deferred = Q.defer();
    if(entity.priceToBuy)
        sql = mustache.render(
            'insert into products (ProName, TinyDes, FullDes, Price, CatID, Quantity, PriceToBuy, UserID, TimeUp, TimeDown, DeltaPrice) values ("{{proName}}", "{{tinyDes}}", "{{fullDes}}",{{price}}, {{catID}}, {{quantity}}, {{priceToBuy}}, {{userID}}, "{{timeUp}}", "{{timeDown}}", {{deltaPrice}})',
            entity        
        );
    else
        sql = mustache.render(
            'insert into products (ProName, TinyDes, FullDes, Price, CatID, Quantity, UserID, TimeUp, TimeDown, DeltaPrice) values ("{{proName}}", "{{tinyDes}}", "{{fullDes}}",{{price}}, {{catID}}, {{quantity}}, {{userID}}, "{{timeUp}}", "{{timeDown}}", {{deltaPrice}})',
            entity        
        );
    db.insert(sql).then(function(insertId) {
        deferred.resolve(insertId);
    });

    return deferred.promise;
}

exports.deleteByCat = function(id) {

    var deferred = Q.defer();

    var sql = 'delete from products where CatID = ' + id;

    db.delete(sql).then(function(affectedRows) {
        deferred.resolve(insertId);
    });
    return deferred.promise;
}

exports.loadAllByFavorite = function(userid) {
    var deferred = Q.defer();

    if(!userid)
    {
        deferred.resolve(null);
        return deferred.promise;
    }
    var sql = 'SELECT * FROM products WHERE ProID IN (SELECT ProID From favorites WHERE UserID = ' + userid + ')';
    db.load(sql).then(function(rows) {
        deferred.resolve(rows);
    });
    return deferred.promise;
}

exports.loadPageByFavorite = function(userid, limit, offset) {

    var deferred = Q.defer();

    var promises = [];

    var view = {
        userid: userid,
        limit: limit,
        offset: offset
    };

    var sqlCount = mustache.render('SELECT COUNT(*) as total FROM products WHERE ProID IN (SELECT ProID From favorites WHERE UserID = {{userid}})', view);
    promises.push(db.load(sqlCount));

    var sql = mustache.render('SELECT * FROM products WHERE ProID IN (SELECT ProID From favorites WHERE UserID = {{userid}}) limit {{limit}} offset {{offset}}', view);
    promises.push(db.load(sql));

    Q.all(promises).spread(function(totalRow, rows) {
        var data = {
            total: totalRow[0].total,
            list: rows
        }
        deferred.resolve(data);
    });
    
    return deferred.promise;
}

exports.loadPageByAuction = function(userid, limit, offset) {

    var deferred = Q.defer();

    var promises = [];

    var view = {
        userid: userid,
        limit: limit,
        offset: offset
    };

    var sqlCount = mustache.render('SELECT COUNT(*) as total FROM products WHERE ProID IN (SELECT ProID From auctions WHERE UserID = {{userid}} GROUP BY UserID) AND State = "đang đấu giá"', view);
    promises.push(db.load(sqlCount));

    var sql = mustache.render('SELECT * FROM products WHERE ProID IN (SELECT ProID From auctions WHERE UserID = {{userid}} GROUP BY UserID) AND State = "đang đấu giá" limit {{limit}} offset {{offset}}', view);
    promises.push(db.load(sql));

    Q.all(promises).spread(function(totalRow, rows) {
        var data = {
            total: totalRow[0].total,
            list: rows
        }
        deferred.resolve(data);
    });
    
    return deferred.promise;
}

exports.loadPageByBasket = function(userid, limit, offset) {

    var deferred = Q.defer();

    var promises = [];

    var view = {
        userid: userid,
        limit: limit,
        offset: offset
    };
    var sql1 = mustache.render('SELECT count(*) as total FROM products WHERE HandleID  = {{userid}} AND State <> "đang đấu giá"', view);
    promises.push(db.load(sql1));
    var sql = mustache.render('SELECT * FROM products WHERE HandleID  = {{userid}} AND State <> "đang đấu giá" limit {{limit}} offset {{offset}}', view);
    promises.push(db.load(sql));

    Q.all(promises).spread(function(totalRow, rows) {
        var data = {
            total: totalRow[0].total,
            list: rows
        }
        deferred.resolve(data);
    });
    
    return deferred.promise;
}
exports.loadPageByOnSale = function(userid, limit, offset) {

    var deferred = Q.defer();

    var promises = [];

    var view = {
        userid: userid,
        limit: limit,
        offset: offset
    };

    var sqlCount = mustache.render('SELECT COUNT(*) as total FROM products WHERE UserID = {{userid}} AND State = "đang đấu giá"', view);
    promises.push(db.load(sqlCount));

    var sql = mustache.render('SELECT * FROM products WHERE UserID = {{userid}} AND State = "đang đấu giá" limit {{limit}} offset {{offset}}', view);
    promises.push(db.load(sql));

    Q.all(promises).spread(function(totalRow, rows) {
        var data = {
            total: totalRow[0].total,
            list: rows
        }
        deferred.resolve(data);
    });
    
    return deferred.promise;
}
exports.loadPageBySold = function(userid, limit, offset) {

    var deferred = Q.defer();

    var promises = [];

    var view = {
        userid: userid,
        limit: limit,
        offset: offset
    };

    var sqlCount = mustache.render('SELECT COUNT(*) as total FROM products WHERE UserID = {{userid}} AND State <> "đang đấu giá"', view);
    promises.push(db.load(sqlCount));

    var sql = mustache.render('SELECT * FROM products WHERE UserID = {{userid}} AND State <> "đang đấu giá" limit {{limit}} offset {{offset}}', view);
    promises.push(db.load(sql));

    Q.all(promises).spread(function(totalRow, rows) {
        var data = {
            total: totalRow[0].total,
            list: rows
        }
        deferred.resolve(data);
    });
    
    return deferred.promise;
}
exports.search = function(entity){
    var deferred = Q.defer();

    var text = entity.text;
    var findBy = entity.findBy;
    var arrange = entity.arrange;
    var sql;

    if(findBy === 'Tìm theo danh mục')
    {
        findBy = mustache.render('where CatID in (select CatID from categories where CatName like "%{{text}}%")', entity);
    }
    else if(findBy === 'Tìm theo tên sản phẩm')
    {
        findBy = mustache.render('where ProName like "%{{text}}%"', entity);
    }
    else if(findBy === 'Tất cả')
    {
        findBy = mustache.render('where CatID in (select CatID from categories where CatName like "%{{text}}%") or ProName like "%{{text}}%"', entity);
    }

    sql = mustache.render('select * from products ' + findBy + ' order by ', entity);
    if(arrange === 'Thời gian hết hạn tăng')
    {
        sql = sql + 'TimeDown asc';
    }
    else if(arrange === 'Thời gian hết hạn giảm')
    {
        sql = sql + 'TimeDown desc';
    }
    else if(arrange === 'Giá tăng dần')
    {
        sql = sql + 'Price asc';
    }
    else if(arrange === 'Giá giảm dần')
    {
        sql = sql + 'Price desc';
    }
    else if(arrange === 'Tất cả')
    {
        sql = sql + 'TimeUp desc';
    }
    db.load(sql).then(function(rows){
        deferred.resolve(rows);
    })

    return deferred.promise;
}

exports.getNumberOfAuction = function(ProID) {
    var deferred = Q.defer();

    if(!ProID)
    {
        deferred.resolve(null);
        return deferred.promise;
    }
    var sql = 'SELECT count(*) as number FROM auctions WHERE ProID = ' + ProID + ' group by ProID';
    db.load(sql).then(function(rows) {
        if(rows[0])
            deferred.resolve(rows[0].number);
        else
            deferred.resolve(0);
    });
    return deferred.promise;
}

exports.updateHandlePrice = function(ProID, UserID){
    var deferred = Q.defer();
    if(UserID)
    {
        var sql = 'update products set HandleID = ' + UserID + ' where ProID = ' + ProID;
        db.update(sql).then(function(changedRows){
            deferred.resolve(changedRows);
        });
    }
    else
    {
        var sql = 'update products set HandleID = NULL where ProID = ' + ProID;
        db.update(sql).then(function(changedRows){
            deferred.resolve(changedRows);
        });
    }

    return deferred.promise;
}

exports.updateState = function(ProID, State){
    var deferred = Q.defer();
    if(State)
    {
        var sql = 'update products set State = "' + State + '" where ProID = ' + ProID;
        db.update(sql).then(function(changedRows){
            deferred.resolve(changedRows);
        });
    }
    else
    {
        deferred.resolve(0);
    }

    return deferred.promise;
}

exports.findSolder = function(ProID){
    var deferred = Q.defer();
    if(ProID)
    {
        var sql = 'select * from users where ID = (select UserID from products where ProID = ' + ProID + ')';
        db.load(sql).then(function(rows){
            if(rows[0])
                deferred.resolve(rows[0]);
            else
                deferred.resolve(null);
        });
    }
    else
    {
        deferred.resolve(null);
    }

    return deferred.promise;
}

exports.updateFullDes = function(entity){
    var deferred = Q.defer();
    if(entity.proId)
    {
        var sql = mustache.render(
            'update products set FullDes = "{{desc}}" where ProID = {{proId}}',
            entity
            );
        db.insert(sql).then(function(changedRows) {
            deferred.resolve(changedRows);
        });
    }
    else
    {
        deferred.resolve(null);
    }

    return deferred.promise;
}

exports.loadWonList = function(userID){
    var deferred = Q.defer();
    if(userID)
    {
        var sql = 'select * from products where State <> "đang đấu giá" and HandleID = ' + userID;
        console.log(sql);
        db.load(sql).then(function(rows) {
            console.log(rows);
            deferred.resolve(rows);
        });
    }
    else
    {
        deferred.resolve(null);
    }

    return deferred.promise;
}