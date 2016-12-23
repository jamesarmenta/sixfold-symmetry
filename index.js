var COLLECTION = 'sixfold-items';

/*----------  REQUIRE  ----------*/

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
var stats = {};
var curators = require('./assets/curators.json').curators;
var artists = require('./assets/artists.json').artists;
var credits = require('./assets/credits.json');

//INITIAL
connectMongo(dbUrl, COLLECTION)
  .then((collection) => {
    itemsCollection = collection;
    updateLocal();
    startServer();
  });

/*----------  FUNCTIONS  ----------*/

function updateLocal() {
  dbFind(itemsCollection, {}, { "views": 1 }).then((results) => {
    items = results;

    var minVisitDuration = 0;
    var maxVisitDuration = 1;
    for (var i = 0; i < results.length; i++) {
      minVisitDuration = (results[i].averageVisitDuration < minVisitDuration) ? results[i].averageVisitDuration : minVisitDuration;
      maxVisitDuration = (results[i].averageVisitDuration > maxVisitDuration) ? results[i].averageVisitDuration : maxVisitDuration;
    }
    stats.minVisitDuration = minVisitDuration;
    stats.maxVisitDuration = maxVisitDuration;
  });

}

function connectMongo(url, collection) {
  return new Promise(
    (resolve, reject) => {
      mongodb.connect(url, function(err, db) {
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
function dbFind(collection, query, sort) {
  return new Promise(
    (resolve, reject) => {
      var results = collection.find(query).sort(sort).toArray();
      resolve(results);
    });
}

function dbFindOne(collection, query) {
  return new Promise(
    (resolve, reject) => {
      var result = collection.findOne(query);
      resolve(result);
    });
}

function dbUpdate(collection, criteria, data) {
  return new Promise(
    (resolve, reject) => {
      //db.COLLECTION_NAME.update(SELECTION_CRITERIA, UPDATED_DATA)
      var results = collection.update(criteria, data);
      resolve(results);
    });
}

function updatePageView(item) {
  if (typeof item !== 'undefined') {
    dbUpdate(itemsCollection, { "_id": item._id }, { $inc: { "views": 1 } })
      .then((results) => {
        updateLocal();
      });
  }
}

//SERVER

function requestedData(name) {
  var index = -1;
  //does requested item exist?
  for (var i = 0; i < items.length; i++) {
    if (name == items[i].slug) {
      index = i;
    }
  }
  //yes it does
  if (index > -1) {
    var artist = '';
    //if it has artist property
    if (items[index].artist) {
      for (var f = 0; f < artists.length; f++) {
        //we have a match
        if (artists[f].name == items[index].artist) {
          artist = artists[f];
        }
      }
    }
    return { items: items, index: index, artist: artist, stats: stats };
  } else {
    return { items: items, index: 0, artist: artist, stats: stats };
  }
}

function startServer() {
  //INIT
  app.listen(port, function() {
    console.log('Our app is running on ' + port);
  });
  app.set('view engine', 'ejs');
}

/*----------  ROUTING  ----------*/
//HOME PAGE
app.get('/', function(req, res) {
  // console.log('home');
  res.render('pages/index', {
    items: items,
    index: 0,
    stats: stats
  });
  updateLocal();
});

app.get('/about/', function(req, res) {
  // console.log('about');
  var locals = requestedData();
  res.render('pages/about', locals);
});

app.get('/curators/', function(req, res) {
  // console.log('about');
  var locals = requestedData();
  locals.curators = curators;
  res.render('pages/curators', locals);
});

app.get('/credits/', function(req, res) {
  // console.log('about');
  var locals = requestedData();
  locals.credits = credits;
  res.render('pages/credits', locals);
});

app.get('/partials/', function(req, res) {
  // console.log('partial home');
  res.render('partials/index', {
    items: items,
    index: 0,
    stats: stats
  });
  updateLocal();
});

// AJAX LOADS
app.get('/partials/:item', function(req, res) {
  var item = req.params.item;
  var locals = requestedData(item);
  if (item == '') {
    res.render('partials/index', {
      items: items,
      index: 0,
      stats: stats
    });
    updateLocal();
  } else if (item == 'about') {
    res.render('partials/about', locals);
  } else if (item == 'curators') {
    locals.curators = curators;
    res.render('partials/curators', locals);
  } else if (item == 'credits') {
    locals.credits = credits;
    res.render('partials/credits', locals);
  } else {
    res.render('partials/item', locals);
  }
  updatePageView(items[locals.index]);
});

// ITEM PAGES
app.get('/:item', function(req, res) {
  // console.log(req.params.item);
  // console.log('item');
  var locals = requestedData(req.params.item);

  res.render('pages/item', locals);
  updatePageView(items[locals.index]);
});

// API POSTS
app.post('/api/item', function(req, res) {
  var name = req.query.name;
  var time = parseInt(req.query.time);

  // console.log(name);
  // console.log(time);

  var average;
  if (name.length > 0) {
    name = name.toString();
    dbFindOne(itemsCollection, { "_id": name }).then((data) => {
      var averageVisitDuration = parseInt(data.averageVisitDuration);
      var views = parseInt(data.views);

      // console.log('time'+ time);

      var newAverage = Math.round(((views * averageVisitDuration) + time) / (views + 1));
      newAverage = (newAverage>300) ? 300 : parseInt(newAverage);
      // console.log('new avg:'+newAverage);

      dbUpdate(itemsCollection, { "_id": data._id }, { $set: { "averageVisitDuration": newAverage } })
        .then((results) => {
          updateLocal();
        });
    });
  }
});

// FILE SERVES
app.get('/assets/images/:image', function(req, res) {
  res.sendFile('assets/images/' + req.params.image, { root: __dirname });
});

app.get('/assets/favicon.ico', function(req, res) {
  res.sendFile('assets/favicon.ico', { root: __dirname });
});

app.get('/assets/fonts/:font', function(req, res) {
  res.sendFile('assets/fonts/' + req.params.font, { root: __dirname });
});
