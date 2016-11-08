var helpers = require('./helpers.js');

var express = require('express');
var app = express();
var http = require('http').createServer(app);
// var io = require('socket.io')(http);
http.listen(3000);

app.set('view engine', 'ejs');

// ROUTING
app.get('/:name', function (req, res) {
  res.render('pages/index',helpers.items);
});


// NOTE: Use WCAG color procedure to test contrast of background-color and text
// http://coenraets.org/blog/2012/10/real-time-web-analytics-with-node-js-and-socket-io/
