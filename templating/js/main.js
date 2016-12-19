/*----------  VARIABLES  ----------*/
var BREAKPOINT2 = 1000;

/*----------  ON DOCUMENT LOAD  ----------*/
$(document).ready(function() {
  flickInit();
  updateItems();
});

/*----------  ON DOCUMENT UPDATE  ----------*/

function documentUpdate() {
  flickInit();
  updateItems();
}

/*----------  GALLERY SLIDES  ----------*/
function flickInit() {
  var gallery = document.querySelector('.expanded-item-gallery');
  if (gallery) {
    var flkty = new Flickity(gallery, {
      freeScroll: true,
      freeScrollFriction: 0.1,
      contain: true,
      cellAlign: "left",
      setGallerySize: false
    });
  }
}

/*----------  HOME ITEMS  ----------*/

function updateItems() {
  var items = Array.from(document.querySelectorAll('.item'));

  //for each item
  items.forEach(function(item) {

    //click event handler 
    item.addEventListener('click', function(event) {
      preventDefault(event);
      var item = event.target;

      //if it's not an item, then its a child
      while (!item.classList.contains('item')) {
        //find childs parent
        item = item.parentNode;
      } //var item is now item div

      disableScroll();
      expandSelectedItem(item, '/partials/' + item.id);
    });
  });

  var homeItems = Array.from(document.querySelectorAll('.home-items > .item'));

  for (var i = 1; i < homeItems.length; i++) {
    if (isOverlapping(homeItems[i], homeItems[i - 1]) && window.innerWidth > BREAKPOINT2) {
      $(homeItems[i]).addClass('overlap');
    } else {
      $(homeItems[i]).removeClass('overlap');
    }
  }
}

function expandSelectedItem(item, href) {
  //contains primary, secondary, tertiary divs
  var itemColors = item.querySelector('.item-colors').children;

  for (var i = 0; i < itemColors.length; i++) {
    //copy color div and all the characteristics 
    var clone = itemColors[i].cloneNode(true);
    var existing = window.getComputedStyle(itemColors[i], null);
    var width = clone.style.width = existing.getPropertyValue('width');
    var height = clone.style.height = existing.getPropertyValue('height');
    clone.style.backgroundColor = existing.getPropertyValue('background-color');

    var coords = getCoordinates(itemColors[i]);

    clone.style.top = (coords.top + $(window).scrollTop()) + 'px';
    clone.style.left = (coords.left + $(window).scrollLeft()) + 'px';
    clone.style.position = 'absolute';
    clone.style.transform = 'scale(1)';
    //append clone to body
    document.body.appendChild(clone);
    //scale using window height or width?
    var scaleWidth = (window.innerWidth + coords.left) / width.replace('px', '') * 2;
    var scaleHeight = (window.innerHeight + coords.top) / height.replace('px', '') * 2;
    var finalScale = (scaleHeight > scaleWidth) ? scaleHeight : scaleWidth;
    //how much should animation delay? 
    var delay = i / 6;
    scaleItem(clone, finalScale, delay);

    //on last one... do this
    if (i == itemColors.length - 1) {
      var itemName = href.replace('/partials/', '');
      History.pushState({
        'loadUrl': href,
        'delay': delay + 1000,
        'itemName': itemName
      }, document.title, itemName);
    }
  }
}

function loadContentArea(href, delay, itemName) {
  //just in case
  setTimeout(function(){$('#content-area').removeClass('fadeOut');},2000);
  setTimeout(function() {
    $('body').removeClass();
    $('body').addClass(itemName);
  }, delay-200);

  // console.log('load content');
  $('#content-area').addClass('fadeOut');
  //TODO: Scroll to top
  setTimeout(function() {
    $('#content-area').load(href, function() {
      window.scrollTo(0, 0);
      $('#content-area').imagesLoaded(function() {
        //push to state history
        enableScroll();
        documentUpdate();
        $('#content-area').removeClass('fadeOut');
        // console.log('starting ' + window.location.pathname);
        startVisit(window.location.pathname);
      });
    });
  }, 1000);
}

// FIXME: Fix so that transform is cross-browser (moz, etc.)
function scaleItem(item, finalScale, delay) {
  //OPENING ANIMATION
  window.setTimeout(function() {
    item.style.transition = 'transform 1s ease-in-out ' + delay + 's';
    item.style.transform = 'scale(' + finalScale + ')';
  }, 0);

  window.setTimeout(function() {
    item.remove();
  }, delay + 1000);
}

(function(window, undefined) {
  // Bind to StateChange Event
  History.Adapter.bind(window, 'statechange', function() {
    endVisit();
    // store the State object
    var State = History.getState();
    // all the data you passed is accessable here now
    var data = State.data;

    if (typeof data.loadUrl !== 'undefined' && data.loadUrl.includes('partials')) {
      loadContentArea(data.loadUrl, data.delay, data.itemName);
    } else {
      // console.log('not a partial');
      window.location = State.url;
    }
  });
})(window);

/*----------  PAGE VIEWS AND AVERAGE TIMES  ----------*/
var visit;
startVisit(window.location.pathname.replace('/', ''));


function startVisit(pageName) {
  pageName = pageName || '';
  // console.log('visit started');
  visit = {};
  visit.name = pageName;
  visit.time = Date.now();
}

function endVisit() {
  // console.log('ending ' + visit.name);
  visit.time = Math.round((Date.now() - visit.time) / 1000);
  visit.name = visit.name.replace('/', '');
  // console.log('visit ended at ' + visit.time);
  $.ajax({
    url: "/api/item?name=" + visit.name + "&time=" + visit.time,
    method: "POST"
  });
}

window.onbeforeunload = function() {
  visit.time = Math.round((Date.now() - visit.time) / 1000);
  visit.name = visit.name.replace('/', '');
  $.ajax({
    url: "/api/item?name=" + visit.name + "&time=" + visit.time,
    method: "POST"
  });
};

/*----------  HELPERS  ----------*/

$('nav a').click(function() {
  var href = $(this).attr('href');
  // update the url, preserve title
  History.pushState({ 'loadUrl': href, 'delay': 1000 }, document.title, href.replace('/partials/', '/'));

  // cancel the normal action of the hyperlink
  return false;
});

function getCoordinates(element) {
  var coords = element.getBoundingClientRect();
  return coords;
}

function getSize(element) {
  var size = {};
  size.width = parseInt(window.getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
  size.height = parseInt(window.getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
  return size;
}

function isOverlapping(element1, element2) {
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

function getStyle(element) {
  var all = window.getComputedStyle(element, null);
  var style = {};

  style.marginTop = parseInt(all.getPropertyValue('margin-top').replace('/[^\d]*/g', ''));
  style.marginRight = parseInt(all.getPropertyValue('margin-right').replace('/[^\d]*/g', ''));
  style.marginBottom = parseInt(all.getPropertyValue('margin-bottom').replace('/[^\d]*/g', ''));
  style.marginLeft = parseInt(all.getPropertyValue('margin-left').replace('/[^\d]*/g', ''));
  style.padding = parseInt(all.getPropertyValue('padding').replace('/[^\d]*/g', ''));

  return style;
}

/*----------  HANLDERS  ----------*/


function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
    e.preventDefault();
  e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
  // left: 37, up: 38, right: 39, down: 40,
  // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
  var keys = {
    37: 1,
    38: 1,
    39: 1,
    40: 1
  };
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

function disableScroll() {
  if (window.addEventListener) // older FF
    window.addEventListener('DOMMouseScroll', preventDefault, false);
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove = preventDefault; // mobile
  document.onkeydown = preventDefaultForScrollKeys;
}

function enableScroll() {
  if (window.removeEventListener) {
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
    // ignore resize events as long as an actualResizeHandler execution is in the queue
    if (!resizeTimeout) {
      resizeTimeout = setTimeout(function() {
        resizeTimeout = null;
        actualResizeHandler();

        // The actualResizeHandler will execute at a rate of 15fps
      }, 600);
    }
  }

  function actualResizeHandler() {
    documentUpdate();
  }
}());
