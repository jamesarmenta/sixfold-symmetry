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
    // console.log(items);
  });
  app.set('view engine', 'ejs');

  app.get('/', function (req, res) {
    res.render('pages/index', {
      items: items
    });
  });

  app.get('/:item', function (req, res) {
    var index = -1;
    console.log(req.params.item);
    for(var i = 0; i < items.length; i++){

      if(req.params.item == items[i].slug){
        index = i;
      }
    }
    if(index>-1){
      res.render('partials/item', {
        items: items,
        index: index
      });
    }else{
      res.send(req.params.item+' not available');
    }
  });

  app.get('/api/items', function (req, res) {
    res.send(items);
  });

  app.get('/api/items/:itemName', function (req, res) {
    var requestedItem = req.params.itemName;
    if(requestedItem in items){
      res.render('pages/item');
    }else{
      res.send('ERROR: '+requestedItem+' not available.');
    }
  });
}
