/*----------  REQUIRE  ----------*/
var config = require('./config-private');

//items
var parser = require('./parse-item-files');

//server
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var port = process.env.PORT || 8080;

//db
var mongodb = require('mongodb');
var dbUrl = process.env.DB_URL || config.DB_URL;

/*----------  ACTIONS  ----------*/
var items = [];
parser.getItemsAsync('assets/items/','.md').then((data)=>{
  //TODO: Create function to sort data based on views 
  items = data;
  startServer();
});


// var itemStats = dbConnect(dbUrl);

// itemStats.then((data)=>{
  //   console.log(data);
  // });

  /*----------  FUNCTIONS  ----------*/
  function dbConnect(dbUrl){
    return new Promise(function(resolve, reject) {
      mongodb.connect(dbUrl, function (err, db) {
        if (err) {
          console.log('Unable to connect to the mongoDB server.', err);
        } else {
          console.log('Connection established to DB');
          resolve(db.collection("item-stats"));
        }
      });
    });
  }

  function getItemStats(slug){
    return new Promise(function(resolve, reject) {
      console.log('getting....');
      // var slugStats = itemStats.find({});
      console.log('here:'+slugStats);
      resolve(slugStats);
    });
  }

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

    app.get('/assets/images/:image', function (req, res) {
      res.sendFile('assets/images/'+req.params.image, { root : __dirname});
    });
  }
