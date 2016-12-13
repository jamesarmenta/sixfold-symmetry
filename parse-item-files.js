var getFiles = require('./get-files');

function getItemsAsync(path,extension){
  return new Promise(
    (resolve,reject)=>{
      var items = [];

      getFiles.getFilesByTypeAsync(path,extension).then((filePaths)=>{
        //filePaths is list of files
        //get text from files
        var fileTextPromises = filePaths.map(getFiles.readFileAsync);
        //resolve promises
        var fileTexts = Promise.all(fileTextPromises);

        var fileNames = filePaths.map((filePath)=>{
          return filePath.replace(path,'').replace(extension,'').replace(/[\W]/g,'-').toLowerCase();
        });

        fileTexts.then((fileText)=>{
          //for each file, parse custom
          fileText.forEach( function(element, index) {
            let temp = customParser(element);
            temp.slug=fileNames[index];
            items[index] = temp;
          });

          //finally, resolve
          resolve(items);
        });

      });

    });
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
  return obj;
}

module.exports = {
  getItemsAsync: getItemsAsync
};