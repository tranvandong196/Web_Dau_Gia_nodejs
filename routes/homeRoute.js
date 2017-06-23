var express = require('express');
var Q = require('q');
var homeRoute = express.Router();
var product = require('../models/product');

homeRoute.get('/', function(req, res) {
	var top5OfAuction;
	var top5OfPrice;
	var top5OfTimeDown;
	Q.all([
        product.loadTop5OfAuction(), product.loadTop5OfPrice(), product.loadTop5OfTimeDown()
    ]).then(function(rows){
    	top5OfAuction = rows[0];
    	top5OfPrice = rows[1];
    	top5OfTimeDown = rows[2];
    	res.render('home/index', {
	        layoutModels: res.locals.layoutModels,
	        top5OfAuction: top5OfAuction,
	        top5OfPrice: top5OfPrice,
	        top5OfTimeDown: top5OfTimeDown,
    });
    });
	// product.loadTop5OfAuction().then(function(rows)
	// 	{
	// 		top5OfAuction = rows;
	// 		console.log("route: " + rows);
	// 	});
	// product.loadTop5OfPrice().then(function(rows)
	// 	{
	// 		top5OfPrice = rows;
	// 	});
	// product.loadTop5OfTimeDown().then(function(rows)
	// 	{
	// 		top5OfTimeDown = rows;
	// 	});
});

module.exports = homeRoute;