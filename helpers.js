var fs = require('fs');

function getItemsAsync(path,extension){

  return new Promise(
    (resolve,reject)=>{
      getFilesByTypeAsync(path,extension).then((data)=>{

        var items = {};
        var fileTextPromises = data.map(readFileAsync);
        var fileText = Promise.all(fileTextPromises);

        fileText.then((data)=>{
          data.forEach( function(element, index) {
            let temp = customParser(element);
            items[temp.slug] = temp;
          });
          resolve(items);
        });
      });
    });
}

function getFilesByTypeAsync(path,extension){
  return new Promise(
    (resolve,reject)=>{
      var validFiles = [];

      fs.readdir(path, (err, files) => {
        if(err) reject(err);

        files.forEach(file => {
          if(file.indexOf(extension)>0){
            validFiles.push(path+file);
          }
        });

        resolve(validFiles);

      });
    });
}

function readFileAsync(input) {
  return new Promise(
    (resolve,reject)=>{
      fs.readFile(input, 'utf8', function (err,data) {
        if(err){
          reject(err);
        }
        resolve(data);
      });
    } );
}

function customParser(text){
  var keySignifier = '##';
  var arraySignifier = '#*';

  var data = text.split(keySignifier);

  var obj = {};
  data.forEach((item,index)=>{
    if(data[index]){
      data[index] = data[index].trim();

      let firstLine = /^(.*)\n/;
      let keyAndValue = data[index].split(firstLine);

      //Index [0] is an empty string = ''
      let key = keyAndValue[1].toLowerCase();
      let value = keyAndValue[2].trim();

      if(value.indexOf(arraySignifier)>-1){
        //if it's supposed to be an array, convert to array.
        //filter for empty array elements
        value = value.split(arraySignifier).filter(function(el){
          return el.length != 0;
        });
        //call trim() on each member
        value = value.map(Function.prototype.call, String.prototype.trim);
      }
      //assign key and value to file object
      obj[key] = value;
    }
  });
  obj['slug'] = obj.title.replace(/[\W]/g,'').toLowerCase();
  return obj;
}

module.exports = {
  getItemsAsync: getItemsAsync
};