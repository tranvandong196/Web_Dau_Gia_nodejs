var express = require("express");
var morgan = require("morgan");
var path = require("path");
var http = require("http");

var app = express();

// app.use(function(request, response, next) {
//     console.log("In comes a " + request.method + " to " + request.url);
//     next();
// });

app.use(morgan('short'));

var publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));

// app.use(function(request, response, next) {
//     if (request.ip === EVIL_IP) {
//         response.status(401).send("Not allowed!");
//     } else {
//         next();
//     }
// });

// app.use(function(request, response, next) {
//     var minute = (new Date()).getMinutes();
//     if ((minute % 2) === 0) {
//         next();
//     } else {
//         response.statusCode = 403;
//         response.end("Not authorized.");
//     }
// });

app.use(function(request, response) {

    // console.log("In comes a request to: " + request.url);
    // response.end("Hello, world!");

    response.writeHead(200, {
        "Content-Type": "text/html"
    });
    response.end("<b>Hello, world!</b>");
});

// http.createServer(app).listen(3000);
app.listen(3000);