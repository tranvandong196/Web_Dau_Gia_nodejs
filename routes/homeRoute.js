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


	var date = [];
	var price = [];
	var name = [];
	var tmp='';
	var temp='';

	Q.all([
		auction.SumOfProduct(), auction.SumOfAuction(), auction.loadAllAuctions(), auction.loadUserName()
		]).then(function(rows){
			for(var i=1;i<=rows[0][0].COUNT;i++)
			{
				try {
					fs.statSync('public/infor/'+i);
				} catch(e) {
					fs.mkdirSync('public/infor/'+i);
				}
				
			}
			
			for(var i=1;i<=rows[0][0].COUNT;i++)
			{
				fs.writeFile('public/infor/'+i+'/history.txt', '', (err) => {
					if (err) throw err;
				});
			}

			for(var j=0;j<rows[1][0].COUNT;j++)
			{
				date[j] = dateFormat(rows[2][j].Date, "yyyy-mm-dd HH:MM:ss");
				price[j] = currencyFormatter.format(rows[2][j].Price, { code: 'VND' });
				for(var h=0;;h++)
				{
					if(rows[2][j].UserID == rows[3][h].ID)
					{
						for(var i=0;i<rows[3][h].Username.length - 1;i++)
						{
							temp+='*'
						}
						temp+=rows[3][h].Username[rows[3][h].Username.length - 1];
						name[j] = temp;
						break;
					}
				}
				tmp+=date[j] + '  -  ' +name[j]+ '  =>  ' +price[j] + '\r\n';

				fs.appendFile('public/infor/'+rows[2][j].ProID+'/history.txt', tmp, (err) => {
					if (err) throw err;
				});
				temp='';
				tmp='';
			}

		});


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