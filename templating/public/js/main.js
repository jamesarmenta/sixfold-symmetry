var BREAKPOINT2 = 1000;
var TEXTCOLORDARK = '#262626';
var TEXTCOLORLIGHT = '#FFFFFF';


var scrollX;
var scrollY;

$( document ).ready(function() {
  flickInit();
  updateItems();
});


function documentUpdate(){
  flickInit();
  flickResize();
  updateItems();
}


function flickResize(){
  $('.expanded-item-gallery').flickity('resize');
}

function flickInit(){
  $('.expanded-item-gallery').flickity({
    freeScroll: true,
    freeScrollFriction: 0.1,
    contain: true,
    cellAlign: 'left',
    setGallerySize: false
  });
}



function updateItems(){
  $('.content-area > .item').each(function(){
    var range = -80;
    var value = Math.floor(Math.random() * range);
    $(this).attr('data-parallax','{"y" : '+value+'}');
  });

  var items = Array.from(document.querySelectorAll('.item'));

  items.forEach(function(item) {

    item.addEventListener('click', function(event) {
      preventDefault(event);
      var item = event.target;

      while (!item.classList.contains('item')) {
        item = item.parentNode;
      } 

      disableScroll();
      expandSelectedItem(item, item.id);
    });
  });

  var homeItems = Array.from(document.querySelectorAll('.home-items > .item'));
  for(var i = 1; i < homeItems.length; i++){
    var item = homeItems[i];
    if(isOverlapping(homeItems[i],homeItems[i-1])&&window.innerWidth>BREAKPOINT2){
      var coord = getCoordinates(item);
      var width = getSize(item).width;
      var right = coord.right;

      if((right+width>window.innerWidth)){
        item.classList += ' overlapping-left';
      }else{
        item.classList += ' overlapping-right';
      }
    }else{
      item.classList.remove('overlapping-right');
      item.classList.remove('overlapping-left');
    }
  }
}

function expandSelectedItem(item, href) {
  var itemColors = item.querySelector('.item-colors').children;

  for (var i = 0; i < itemColors.length; i++) {
    var clone = itemColors[i].cloneNode(true);
    var existing = window.getComputedStyle(itemColors[i], null);
    var width = clone.style.width = existing.getPropertyValue('width');
    var height = clone.style.height = existing.getPropertyValue('height');
    clone.style.backgroundColor = existing.getPropertyValue('background-color');

    var coords = getCoordinates(itemColors[i]);

    clone.style.top = (coords.top+$(window).scrollTop())+'px';
    clone.style.left = (coords.left+$(window).scrollLeft())+'px';
    clone.style.position = 'absolute';
    clone.style.transform = 'scale(1)';
    document.body.appendChild(clone);
    var scaleWidth = (window.innerWidth+coords.left)/width.replace('px','')*2;
    var scaleHeight = (window.innerHeight+coords.top)/height.replace('px','')*2;
    var finalScale = (scaleHeight > scaleWidth) ? scaleHeight : scaleWidth;
    var delay = i/6;
    scaleItem(clone,finalScale,delay);

    if(i==itemColors.length-1){
      setTimeout(function() {
        document.querySelector('body').style.backgroundColor = clone.style.backgroundColor;
        document.querySelector('body').style.color = contrastTextColor(clone.style.backgroundColor);
        document.querySelectorAll('a').forEach(function(element, index){element.style.color = contrastTextColor(clone.style.backgroundColor);});
      }, delay+1000);
      loadContentArea(href,delay+1000);
    }
  }

}

function contrastTextColor(rgb){
  rgb = rgb.replace('rgb(','').replace(')','').split(', ');
  var red = parseInt(rgb[0]);
  var green = parseInt(rgb[1]);
  var blue = parseInt(rgb[2]);

  var lum = (0.299*red + 0.587*green + 0.114*blue);
  if(lum>127){
    return TEXTCOLORDARK;
  }else{
    return TEXTCOLORLIGHT;
  }

}

function loadContentArea (href,delay){
  $('#content-area').addClass('fadeOut');
  setTimeout(function() {
    $('#content-area').load('/'+href, function(){
      $('#content-area').imagesLoaded( function() {
        documentUpdate();
        window.scrollTo(0,0);
        enableScroll();
        $('#content-area').removeClass('fadeOut');
      });
    });
  }, delay);
}

function scaleItem(item,finalScale,delay){
  window.setTimeout(function(){
    item.style.transition = 'transform 1s ease-in-out '+delay+'s';
    item.style.transform = 'scale('+finalScale+')';
  },0);

  window.setTimeout(function(){
    item.remove();
  },delay+1000);
}



function getCoordinates(element) {
  var coords = element.getBoundingClientRect();

  return coords;
}

function getSize(element) {
  var size = {};
  size.width = parseInt(window.getComputedStyle(element, null).getPropertyValue('width').replace('px',''));
  size.height = parseInt(window.getComputedStyle(element, null).getPropertyValue('height').replace('px',''));
  return size;
}

function isOverlapping(element1,element2){
  var coordinates1 = getCoordinates(element1);
  var size1 = getSize(element1);
  var el1 = {};

  el1.left = coordinates1.left;
  el1.right = coordinates1.right;
  el1.top = coordinates1.top;
  el1.bottom = coordinates1.bottom;

  var coordinates2 = getCoordinates(element2);
  var size2 = getSize(element2);
  var el2 = {};

  el2.left = coordinates2.left;
  el2.right = coordinates2.right;
  el2.top = coordinates2.top;
  el2.bottom = coordinates2.bottom;

  var overlap = !(el1.right < el2.left || 
    el1.left > el2.right || 
    el1.bottom < el2.top || 
    el1.top > el2.bottom);

  return overlap;
}

function getStyle(element){
  var all = window.getComputedStyle(element, null);
  var style = {};

  style.marginTop = parseInt(all.getPropertyValue('margin-top').replace('px',''));
  style.marginRight = parseInt(all.getPropertyValue('margin-right').replace('px',''));
  style.marginBottom = parseInt(all.getPropertyValue('margin-bottom').replace('px',''));
  style.marginLeft = parseInt(all.getPropertyValue('margin-left').replace('px',''));
  style.padding = parseInt(all.getPropertyValue('padding').replace('px',''));

  return style;
}



function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
    e.preventDefault();
  e.returnValue = false;  
}

function preventDefaultForScrollKeys(e) {
  var keys = {37: 1, 38: 1, 39: 1, 40: 1};
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

function disableScroll(){
  if (window.addEventListener) 
    window.addEventListener('DOMMouseScroll', preventDefault, false);
  window.onwheel = preventDefault; 
  window.onmousewheel = document.onmousewheel = preventDefault; 
  window.ontouchmove  = preventDefault; 
  document.onkeydown  = preventDefaultForScrollKeys;
}

function enableScroll(){
  if (window.removeEventListener){
    window.removeEventListener('DOMMouseScroll', preventDefault, false);
  }
  window.onmousewheel = document.onmousewheel = null; 
  window.onwheel = null; 
  window.ontouchmove = null;  
  document.onkeydown = null; 
}

(function() {
  window.addEventListener('resize', resizeThrottler, false);

  var resizeTimeout;
  function resizeThrottler() {
    if ( !resizeTimeout ) {
      resizeTimeout = setTimeout(function() {
        resizeTimeout = null;
        actualResizeHandler();

      }, 600);
    }
  }

  function actualResizeHandler() {
    documentUpdate();
  }
}());