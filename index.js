var COLLECTION = 'sixfold-items';

/*----------  REQUIRE  ----------*/
var config = require('./config-private');

//server
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var port = process.env.PORT || 8080;

//db
var mongodb = require('mongodb');
var dbUrl = process.env.DB_URL || config.DB_URL;

var itemsCollection;
var items = [];
var faculty = require('./assets/faculty.json').faculty;

console.log(faculty[0]);

//INITIAL
connectMongo(dbUrl, COLLECTION)
.then((collection)=>{
  itemsCollection = collection;
  updateLocal();
  startServer();
});

/*----------  FUNCTIONS  ----------*/

function updateLocal(){
  dbFind(itemsCollection,{},{"title" : 1}).then((results)=>{
    // console.log(results);
    items = results;
  });
}

function connectMongo(url,collection){
  return new Promise(
    (resolve,reject)=>{
      mongodb.connect(url, function (err, db) {
        if (err) {
          console.log('Unable to connect to the mongoDB server.', err);
        } else {
          console.log('Connection to DB established');
          resolve(db.collection(collection));
        }
      });
    });
}

//MONGODB
function dbFind(collection,query,sort){
 return new Promise(
  (resolve,reject)=>{
    var results = collection.find(query).sort(sort).toArray();
    resolve(results);
  });
}

function dbFindOne(collection,query){
 return new Promise(
  (resolve,reject)=>{
    var result = collection.findOne(query);
    resolve(result);
  });
}

function dbUpdate(collection,query){
  return new Promise(
    (resolve,reject)=>{
      var results = collection.update(query);
      resolve(results);
    });
}

//SERVER

function startServer(){

  //INIT
  app.listen(port, function() {
    console.log('Our app is running on ' + port);
  });
  app.set('view engine', 'ejs');

  //HOME PAGE
  app.get('/', function (req, res) {
    res.render('pages/index', {
      items: items
    });
  });

  //AJAX LOADS
  app.get('/partials/:item', function (req, res) {
    var index = -1;
    for(var i = 0; i < items.length; i++){

      if(req.params.item == items[i].slug){
        index = i;
      }
    }
    if(index>-1){
      console.log(items[index]);
      res.render('partials/item', {
        items: items,
        index: index
      });
    }else{
      res.send(req.params.item+' not available');
    }
  });

  //ITEM PAGES
  app.get('/:item', function (req, res) {
    var index = -1;
    for(var i = 0; i < items.length; i++){

      if(req.params.item == items[i].slug){
        index = i;
      }
    }
    if(index>-1){
      console.log(items[index]);
      res.render('pages/item', {
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
