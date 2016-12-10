var fs = require('fs');

function writeFileAsync(path,content) {
  fs.writeFile(path, content, function(err) {
    if(err) {
      return console.log(err);
    }
  }); 
}

module.exports = {
  writeFileAsync: writeFileAsync
};
