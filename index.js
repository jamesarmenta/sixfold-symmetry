var COLLECTION = 'sixfold-items';

/*----------  REQUIRE  ----------*/
console.log();

//server
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var port = process.env.PORT || 8080;

//db
var mongodb = require('mongodb');
var dbUrl = process.env.DB_URL || require('./config-private').DB_URL;

var itemsCollection;
var items = [];
var faculty = require('./assets/faculty.json').faculty;
var artists = require('./assets/artists.json').artists;

//INITIAL
connectMongo(dbUrl, COLLECTION)
.then((collection)=>{
  itemsCollection = collection;
  updateLocal();
  startServer();
});

/*----------  FUNCTIONS  ----------*/

function updateLocal(){
  dbFind(itemsCollection,{},{"views" : 1}).then((results)=>{
    items = results;
    // console.log('Items loaded.');
    // console.log(items);
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

function dbUpdate(collection,criteria,data){
  return new Promise(
    (resolve,reject)=>{
      //db.COLLECTION_NAME.update(SELECTION_CRITERIA, UPDATED_DATA)
      var results = collection.update(criteria,data);
      resolve(results);
    });
}

//SERVER

function requestedData(name){
  var index = -1;
  //does requested item exist?
  for(var i = 0; i < items.length; i++){
    if(name == items[i].slug){
      index = i;
    }
  }
  //yes it does
  if(index>-1){
    var artist = '';
    //if it has artist property
    if(items[index].artist){
      for (var f = 0; f < artists.length; f++) {
        //we have a match
        if(artists[f].name == items[index].artist){
          artist = artists[f];
        }
      }
    }
    return {items: items, index: index, artist: artist };
  }
  else{
    return {'error': name+' is not available'};
  }
}

function startServer(){
  //INIT
  app.listen(port, function() {
    console.log('Our app is running on ' + port);
  });
  app.set('view engine', 'ejs');
}

/*----------  ROUTING  ----------*/
//HOME PAGE
app.all(/^\/$/, function (req, res) {
  console.log('home');
  res.render('pages/index', {
    items: items,
    index: 0
  });
  updateLocal();
});

//AJAX LOADS
app.get('/partials/:item', function (req, res) {
  var locals = requestedData(req.params.item);
  console.log('partial item');
  res.render('partials/item', locals);
  updatePageView(items[locals.index]);
});

//ITEM PAGES
app.get('/:item', function (req, res) {
  console.log('item');
  var locals = requestedData(req.params.item);

  res.render('pages/item', locals);
  updatePageView(items[locals.index]);
});


app.get('/assets/images/:image', function (req, res) {
  res.sendFile('assets/images/'+req.params.image, { root : __dirname});
});

app.get('/assets/fonts/:font', function (req, res) {
  res.sendFile('assets/fonts/'+req.params.font, { root : __dirname});
});


// app.post('/api/:image', function (req, res) {
  //     res.sendFile('assets/images/'+req.params.image, { root : __dirname});
  //   });


  function updatePageView(item){
    if(typeof item !== 'undefined'){
      dbUpdate(itemsCollection,{"_id": item._id}, { $inc: { "views": 1}})
      .then((results)=>{
        updateLocal();
      });
    }
  }