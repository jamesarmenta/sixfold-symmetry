var http = require('http');
var getFiles = require('./get-files.js');
var setFiles = require('./set-files.js');

var imageUrlBase = 'res.cloudinary.com/hkhfknnmy/image/upload/v1481323015/assets/color_images/';
var colorImagesPath = 'assets/color-images/';
var imageType = '.jpg';

var colorClusters = [];
getFiles.getFilesByTypeAsync(colorImagesPath,imageType).then((filePaths)=>{
  var fileNames = filePaths.map((element)=>{
    return element.replace(colorImagesPath,'').replace(imageType,'');
  });

  fileNames.forEach( function(fileName, index) {
    colorClusters[index] = getColorClustersAsync(imageUrlBase+fileName+imageType);
  });

  Promise.all(colorClusters).then((clusters)=>{
    console.log('All Complete.');
    clusters.forEach( function(cluster, index) {
      cluster.name = fileNames[index];
    });
    writeClustersCssAsync(clusters);
  });

});

/*----------  FUNCTIONS  ----------*/

function getColorClustersAsync(imageUrl){
  var colorClusters = {};

  var apiBaseUrl = 'http://mkweb.bcgsc.ca/color-summarizer/?url=';
  //TODO: CHANGE TO HIGH PRECISION
  var apiOptions = '&precision=medium&num_clusters=5&json=1';

  return new Promise(
    (resolve,reject)=>{
      console.log('Processing: '+apiBaseUrl+imageUrl+apiOptions);
      http.get(apiBaseUrl+imageUrl+apiOptions, function(res) {

        var body = '';
        res.on('data',(data)=>{
          body += data;
          //let us know still receiving data
          if(Math.random()>.98) process.stdout.write('.');
        });
        res.on('error',(error)=>{
          console.log(error);
        });

        res.on('end',()=>{
          console.log();
          var colorSummary = JSON.parse(body);
          colorClusters['primary'] = {'hex':colorSummary.clusters[0].hex[0], 'frequency':colorSummary.clusters[0].f};
          colorClusters['secondary'] = {'hex':colorSummary.clusters[1].hex[0], 'frequency':colorSummary.clusters[1].f};
          colorClusters['tertiary'] = {'hex':colorSummary.clusters[2].hex[0], 'frequency':colorSummary.clusters[2].f};
          resolve(colorClusters);
        });

      });
    });
}

function writeClustersCssAsync(clusters){
  console.log('Writing css...');
  var cssContent = '';
  clusters.forEach( function(element, index) {
    var primary = {};
    var secondary = {};
    var tertiary = {};

    primary.hex = element.primary.hex;

    secondary.hex = element.secondary.hex;
    secondary.size = ((1/element.primary.frequency)*66*element.secondary.frequency).toFixed(1);

    tertiary.hex = element.tertiary.hex;
    tertiary.size = ((1/element.primary.frequency)*33*element.tertiary.frequency).toFixed(1);
    //just in case teriary is too small
    if(tertiary.size<2){tertiary.size=3; secondary.size = secondary.size*2;}

    cssContent += 
    '.'+element.name+' {'+
    'color:'+contrastTextColor(tertiary.hex)+' !important; '+
    'background-color:'+tertiary.hex+';}\n'+

    '.'+element.name+' a, .'+element.name+' a:visited {'+
    'color:'+contrastTextColor(tertiary.hex)+' !important;'+
    'text-shadow: 1px 1px 1px '+tertiary.hex+', -1px -1px 1px '+tertiary.hex+', 1px -1px 1px '+tertiary.hex+', -1px 1px 1px '+tertiary.hex+';'+

    '.'+element.name+' .expanded-item--label {'+
    'background-color:'+primary.hex+';}\n'+

    '#'+element.name+' .primary {'+
    'background-color:'+primary.hex+'; '+
    'width: 100%; height: 100%;}\n'+

    '#'+element.name+' .secondary {'+
    'background-color:'+secondary.hex+'; '+
    'width: '+secondary.size+'%; '+
    'height: '+secondary.size+'%;}\n'+

    '#'+element.name+' .tertiary {'+
    'background-color:'+tertiary.hex+'; '+
    'width: '+tertiary.size+'%; '+
    'height: '+tertiary.size+'%;}\n';
  });
  console.log('CSS: '+cssContent);
  setFiles.writeFileAsync('views/css/item-colors.css',cssContent);
}

function contrastTextColor(hex){
  var TEXTCOLORDARK = '#262626';
  var TEXTCOLORLIGHT = '#FFFFFF';
  hex = hex.replace('#','');

  var red = parseInt(hex.substring(0,2),16);
  var green = parseInt(hex.substring(2,4),16);
  var blue = parseInt(hex.substring(4,6),16);

  var lum = (0.299*red + 0.587*green + 0.114*blue);
  if(lum>127){
    return TEXTCOLORDARK;
  }else{
    return TEXTCOLORLIGHT;
  }
}