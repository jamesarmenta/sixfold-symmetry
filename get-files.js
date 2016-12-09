var fs = require('fs');

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

module.exports = {
  getFilesByTypeAsync: getFilesByTypeAsync,
  readFileAsync: readFileAsync
};