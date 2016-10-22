var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
http.listen(3000);

app.set('view engine', 'ejs');

var test = ['thing one','thing two','thing three','thing four'];
var second = ['s1','s2','s3','s4'];
var globals = {test: test, second: second}

// ROUTING
app.get('/', function (req, res) {
	res.render('pages/dog',globals);
});

app.get('/:id', function (req, res) {
	//this is a SHALLOW copy, meaning that editing any children of global
	//will alter their global value
	//adding objects, like global.foo, is just fine
	let mylocal = Object.assign({}, globals);
	let id = req.params.id;

	res.render('pages/dog',mylocal);
});

// io.on('connection', function (socket) {
// 	setInterval(function(){
// 		if(Math.random()>Math.random()){
// 			socket.emit('news',Math.random());
// 		}
// 	}, 5000);
// });

//http://coenraets.org/blog/2012/10/real-time-web-analytics-with-node-js-and-socket-io/