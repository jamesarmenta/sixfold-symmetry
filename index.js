var parser = require('./parse-item-files');
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var port = process.env.PORT || 8080;

var items = [];
parser.getItemsAsync('assets/items/','.md').then((data)=>{
  //XXX: Fake data. Remove later.
  for (var i = 0; i < data.length; i++){
    data[i].views = data[i].slug.length;
  }
  //TODO: Create function to sort data based on views 
  items = data;

  startServer();
});

/*----------  FUNCTIONS  ----------*/

function startServer(){
  app.listen(port, function() {
    console.log('Our app is running on ' + port);
    console.log(items);
  });
  app.set('view engine', 'ejs');

  app.get('/', function (req, res) {
    res.render('pages/index', {
      items: items
    });
  });

  app.get('/item', function (req, res) {
    res.render('pages/item');
  });

  app.get('/api/items', function (req, res) {
    res.send(items);
  });

  app.get('/api/items/:itemName', function (req, res) {
    var requestedItem = req.params.itemName;
    if(requestedItem in items){
      res.send(items[requestedItem]);
    }else{
      res.send('ERROR: '+requestedItem+' not available.');
    }
  });
}
