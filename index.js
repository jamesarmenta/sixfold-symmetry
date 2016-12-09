var parser = require('./parse-item-files');

var items = {};
parser.getItemsAsync('assets/items/','.md').then((data)=>{
  items = data;
  console.log('items done');
});

startServer();

function startServer(){
  var express = require('express');
  var app = express();
  var http = require('http').createServer(app);
  // var io = require('socket.io')(http);
  http.listen(3000);

  app.set('view engine', 'ejs');

  app.get('/', function (req, res) {
    res.send('this is the home page');
  });

  app.get('/:itemName', function (req, res) {
    var requestedItem = req.params.itemName;
    if(requestedItem in items){
      res.render('pages/index', items[requestedItem]);
    }else{
      res.send('we don\'t have '+requestedItem);
    }
  });
}
