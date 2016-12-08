var fs = require('fs');
var imgur = require('imgur');

imgur.setClientId('e7fb665e6e4ffd4');
imgur.setAPIUrl('https://api.imgur.com/3/');

getFilesByTypeAsync('assets/featured_images/','.jpg')
.then((files)=>{
  console.log(files);
  //upload to imgur
  return new Promise(
    (resolve,reject)=>{
      var imgurUrls = [];
      var finals = Promise.all(files.map(imgurUploadAsync));
      finals.then((data)=>{
        console.log(data);
      });
    });
})
.then((data)=>{
  // console.log(data);
});


function imgurUploadAsync(path) {
  return new Promise(
    (resolve,reject)=>{
      imgur.uploadFile(path)
      .then(function (json) {
        console.log(json.data.link);
        resolve(json.data.link);
      })
      .catch(function (err) {
        console.error(err.message);
        reject(err.message);
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