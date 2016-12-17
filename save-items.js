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

  for (var i = 0; i < items.length; i++) {
    //preserve newline
    if(items[i].body){ items[i].body = items[i].body.replace(/\n/g,'<br>');}
    if(items[i].description){ items[i].description = items[i].description.replace(/\n/g,'<br>');}
  }
})
.then(()=>{
  // Connect to DB
  return new Promise(
    (resolve,reject)=>{
      resolve(connectMongo(dbUrl,COLLECTION));
    });
})
.then((collection)=>{
  for (var i = 0; i < items.length; i++) {
    items[i]._id = items[i].slug;
    console.log(items[i]._id);

    //db.COLLECTION_NAME.update(SELECTION_CRITERIA, UPDATED_DATA)
    if(i==items.length-1){
      dbUpdate(collection, {"_id": items[i]._id}, {$set: items[i]}).then((results)=>{
        process.exit(0);
      });
    }else{
      dbUpdate(collection, {"_id": items[i]._id}, {$set: items[i]});
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

// function dbSave(collection,query){
  //   return new Promise(
  //     (resolve,reject)=>{
    //       var results = collection.save(query);
    //       resolve(results);
    //     });
    // }

    function dbUpdate(collection,criteria,data){
      return new Promise(
        (resolve,reject)=>{
          //db.COLLECTION_NAME.update(SELECTION_CRITERIA, UPDATED_DATA)
          var results = collection.update(criteria,data);
          resolve(results);
        });
    }