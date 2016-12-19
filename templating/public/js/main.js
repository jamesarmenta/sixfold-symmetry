var BREAKPOINT2 = 1000;

$(document).ready(function() {
  flickInit();
  updateItems();
});


function documentUpdate() {
  flickInit();
  updateItems();
}

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


function updateItems() {
  var items = Array.from(document.querySelectorAll('.item'));
  items.forEach(function(item) {
    item.addEventListener('click', function(event) {
      preventDefault(event);
      var item = event.target;
      while (!item.classList.contains('item')) {
        item = item.parentNode;
      } 
      disableScroll();
      console.log(item.id);
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
  var itemColors = item.querySelector('.item-colors').children;

  for (var i = 0; i < itemColors.length; i++) {
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
    document.body.appendChild(clone);
    var scaleWidth = (window.innerWidth + coords.left) / width.replace('px', '') * 2;
    var scaleHeight = (window.innerHeight + coords.top) / height.replace('px', '') * 2;
    var finalScale = (scaleHeight > scaleWidth) ? scaleHeight : scaleWidth;
    var delay = i / 6;
    scaleItem(clone, finalScale, delay);

    if (i == itemColors.length - 1) {
      var realUrl = href;
      var fakeHref = href.replace('/partials/', '/');
      History.pushState({
        'loadUrl': realUrl,
        'delay': delay + 1000,
        'itemName': fakeHref
      }, document.title, fakeHref);
    }
  }
}

function loadContentArea(href, delay, itemName) {
  $('#content-area').addClass('fadeOut');
  itemName = (typeof itemName !== 'undefined') ? itemName.replace('/', '') : '';
  setTimeout(function() {
    $('body').removeClass();
    $('body').addClass(itemName);
  }, delay);

  setTimeout(function() {
    $('#content-area').load(href, function() {
      window.scrollTo(0, 0);
      $('#content-area').imagesLoaded(function() {
        enableScroll();
        documentUpdate();
        $('#content-area').removeClass('fadeOut');
        startVisit(window.location.pathname);
      });
    });
  }, 1000);
}

function scaleItem(item, finalScale, delay) {
  window.setTimeout(function() {
    item.style.transition = 'transform 1s ease-in-out ' + delay + 's';
    item.style.transform = 'scale(' + finalScale + ')';
  }, 0);

  window.setTimeout(function() {
    item.remove();
  }, delay + 1000);
}

(function(window, undefined) {
  History.Adapter.bind(window, 'statechange', function() {
    endVisit();
    var State = History.getState();
    var data = State.data;

    if (typeof data.loadUrl !== 'undefined' && data.loadUrl.includes('partials')) {
      loadContentArea(data.loadUrl, data.delay, data.itemName);
    } else {
      window.location = State.url;
    }
  });
})(window);

var visit;
startVisit(window.location.pathname.replace('/', ''));
function startVisit(pageName) {
  pageName = pageName || '';
  visit = {};
  visit.name = pageName;
  visit.time = 0;
  setInterval(function() {
    visit.time++;
  }, 995);
}

function endVisit() {
  visit.name = visit.name.replace('/', '');
  $.ajax({
    url: "/api/item?name=" + visit.name + "&time=" + visit.time,
    method: "POST"
  });
}

window.onbeforeunload = function() {
  visit.name = visit.name.replace('/', '');
  $.ajax({
    url: "/api/item?name=" + visit.name + "&time=" + visit.time,
    method: "POST"
  });
};


$('nav a').click(function() {
  var href = $(this).attr('href');
  var fakeHref = href.replace('/partials/', '/');
  console.log('load: ' + href);
  console.log('fake: ' + fakeHref);
  History.pushState({ 'loadUrl': href, 'delay': 1000 }, document.title, fakeHref);
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



function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
    e.preventDefault();
  e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
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
  if (window.addEventListener) 
    window.addEventListener('DOMMouseScroll', preventDefault, false);
  window.onwheel = preventDefault; 
  window.onmousewheel = document.onmousewheel = preventDefault; 
  window.ontouchmove = preventDefault; 
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
    if (!resizeTimeout) {
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
