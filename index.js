var helpers = require('./helpers.js');
// var server = require('./server.js');

var items = {};
helpers.getItemsAsync('assets/items/','.md').then((data)=>{
  items = data;
  startServer();
});

function startServer(){
  var express = require('express');
  var app = express();
  var http = require('http').createServer(app);
  // var io = require('socket.io')(http);
  http.listen(3000);

  app.set('view engine', 'ejs');

  // ROUTING
  app.get('/partials/:name', function (req, res) {

    var local = items[req.params.name];
    
    res.render('partials/item',local);
  });

  app.get('/:name', function (req, res) {

    var local = items[req.params.name];
    
    res.render('pages/item',local);
  });

  app.get('/', function (req, res) {

    res.render('pages/index');
  });
}


// NOTE: Use WCAG color procedure to test contrast of background-color and text
// http://coenraets.org/blog/2012/10/real-time-web-analytics-with-node-js-and-socket-io/
