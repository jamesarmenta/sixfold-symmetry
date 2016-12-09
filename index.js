var parser = require('./parse-item-files');

var items = {};
// parser.getItemsAsync('assets/items/','.md').then((data)=>{
//   items = data;
//   // var bingus = 'viktorekpuk_drawingmemory';
//   // if(bingus in items){
//   //   console.log('yes');
//   // }
// });

startServer();

function startServer(){
  var express = require('express');
  var app = express();
  var http = require('http').createServer(app);
  // var io = require('socket.io')(http);
  http.listen(3000);

  app.set('view engine', 'ejs');

  app.get('/', function (req, res) {
    res.render('pages/index', {foo: 'so true'});
  });
}
