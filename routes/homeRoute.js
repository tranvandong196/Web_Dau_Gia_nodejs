var express = require('express');
var Q = require('q');
var homeRoute = express.Router();
var product = require('../models/product');
var auction = require('../models/auction');
var fs = require('fs');
var currencyFormatter = require('currency-formatter');
var dateFormat = require('dateformat');
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
});

homeRoute.get('/gioi-thieu', function(req, res) {
	res.render('home/gioiThieu', {
		layoutModels: res.locals.layoutModels,
	});
});

homeRoute.get('/hoi-dap', function(req, res) {
	res.render('home/hoiDap', {
		layoutModels: res.locals.layoutModels,
	});
});

homeRoute.get('/lien-he', function(req, res) {
	res.render('home/lienHe', {
		layoutModels: res.locals.layoutModels,
	});
});

module.exports = homeRoute;