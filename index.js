var parser = require('./parse-item-files');
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var port = process.env.PORT || 8080;

var items = {};
parser.getItemsAsync('assets/items/','.md').then((data)=>{
  items = data;
  console.log('items done');
});

startServer();

/*----------  FUNCTIONS  ----------*/

function startServer(){
  app.listen(port, function() {
    console.log('Our app is running on ' + port);
  });
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
