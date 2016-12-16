var COLLECTION = 'sixfold-items';

var config = require('./config-private');
var parser = require('./parse-item-files');

//db
var mongodb = require('mongodb');
var dbUrl = process.env.DB_URL || config.DB_URL;

var items = [];
var itemStats;

// Parse Items
parser.getItemsAsync('assets/items/','.md')
.then((data)=>{
  items = data;
})
.then(()=>{
  // Connect to DB
  return new Promise(
    (resolve,reject)=>{
      resolve(connectMongo(dbUrl,COLLECTION));
    });
})
.then((collection)=>{
  // Save / Update items to DB
  for (var i = 0; i < items.length; i++) {
    items[i]._id = items[i].slug;
    console.log(items[i]._id);

    //either updates or creates new based on _id
    if(i+1==items.length){
      dbSave(collection, items[i]).then(()=>{
        process.exit(0);
      });
    }else{
      dbSave(collection, items[i]);
    }
  }
});


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

function dbSave(collection,query){
  return new Promise(
    (resolve,reject)=>{
      var results = collection.save(query);
      resolve(results);
    });
}