var express = require('express');
var app = express();
var http = require('http').createServer(app);
// var io = require('socket.io')(http);
http.listen(3000);

app.set('view engine', 'ejs');

var test = ['thing one','thing two','thing three','thing four'];
var second = ['s1','s2','s3','s4'];
var globals = {test: test, second: second}

// ROUTING
app.get('/', function (req, res) {
	res.render('pages/index',globals);
});

app.get('/:id', function (req, res) {
	//this is a SHALLOW copy, meaning that editing any children of global
	//will alter their global value
	//adding objects, like global.foo, is just fine
	let mylocal = Object.assign({}, globals);
	mylocal.id = req.params.id;

	res.render('pages/index',mylocal);
});

// NOTE: Use WCAG color procedure to test contrast of background-color and text
// http://coenraets.org/blog/2012/10/real-time-web-analytics-with-node-js-and-socket-io/
