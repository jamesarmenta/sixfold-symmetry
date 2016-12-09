var http = require('http');

//current album: http://imgur.com/a/QKbkf
//hard code is bad
// var images = ['http://imgur.com/hVrxiOx', 'http://imgur.com/ClTr3Ee', 'http://imgur.com/xhKDwjb', 
//   'http://imgur.com/GHd9ixi', 'http://imgur.com/vPsb4fW', 'http://imgur.com/Cb0vdrT', 
//   'http://imgur.com/icyFSbw', 'http://imgur.com/H4LDKCg', 'http://imgur.com/XdS8sLW', 
//   'http://imgur.com/peb83qw', 'http://imgur.com/ic3WF82', 'http://imgur.com/ASRfEy3', 
//   'http://imgur.com/DICQ7qZ', 'http://imgur.com/HTW5umo', 'http://imgur.com/NzNOfei', 
//   'http://imgur.com/5k1wMe1'];

var imageUrlBase = 'http://res.cloudinary.com/hkhfknnmy/image/upload/v1481247488/assets/color_images/';

var images = ['imgur.com/hVrxiOx.jpg'];

images.forEach( function(element, index) {
  getColorClustersAsync(element);
});


function getColorClustersAsync(imageUrl){

  console.log('Processing: ' + imageUrl);
  
  var colorClusters = {};

  var apiBaseUrl = 'http://mkweb.bcgsc.ca/color-summarizer/?url=';
  //TODO: CHANGE TO HIGH PRECISION
  var apiOptions = '&precision=vlow&num_clusters=5&json=1';

  return new Promise(
    (resolve,reject)=>{
      http.get(apiBaseUrl+imageUrl+apiOptions, function(res) {

        var body = '';

        res.on('data',(data)=>{
          body += data;
        });

        res.on('end',()=>{
          var colorSummary = JSON.parse(body);
          colorClusters['primary'] = {'rgb':colorSummary.clusters[0].rgb, 'frequency':colorSummary.clusters[0].f};
          colorClusters['secondary'] = {'rgb':colorSummary.clusters[1].rgb, 'frequency':colorSummary.clusters[1].f};
          colorClusters['tertiary'] = {'rgb':colorSummary.clusters[2].rgb, 'frequency':colorSummary.clusters[2].f};
          console.log(colorClusters);
          resolve(colorClusters);
        });

      });
    });
}