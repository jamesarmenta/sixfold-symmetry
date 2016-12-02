/*----------  ON DOCUMENT LOAD  ----------*/

slickInit();
updateItems();

/*----------  ON DOCUMENT UPDATE  ----------*/

function documentUpdate(){
  slickInit();
  updateItems();
}

/*----------  GALLERY SLIDES  ----------*/

function slickInit(){
  $('.expanded-item-gallery').slick({
    dots: true,
    infinite: true,
    speed: 250,
    fade: true,
    cssEase: 'linear',
    centerMode: true,
    arrows: false,
  });
}

/*----------  HOME ITEMS  ----------*/

function updateItems(){
  const items = Array.from(document.querySelectorAll('.item'));

  //for each item
  items.forEach(function(item) {
    //click event handler 
    item.addEventListener('click', function(event) {
      event.preventDefault();
      var item = event.target;

      //if it's not an item, then its a child
      while (!item.classList.contains('item')) {
        //find childs parent
        item = item.parentNode;
      } //var item is now item div

      disableScroll();
      expandSelectedItem(item);
    });
  });
}

function expandSelectedItem(item) {
  //contains primary, secondary, tertiary divs
  var itemColors = item.querySelector('.item-colors').children;
  
  for (var i = 0; i < itemColors.length; i++) {
    //copy color div and all the characteristics 
    var clone = itemColors[i].cloneNode(true);
    var existing = window.getComputedStyle(itemColors[i], null);
    var width = clone.style.width = existing.getPropertyValue('width');
    var height = clone.style.height = existing.getPropertyValue('height');
    clone.style.backgroundColor = existing.getPropertyValue('background-color');

    var posTop = itemColors[i].getBoundingClientRect().top+window.scrollY;
    var posLeft =itemColors[i].getBoundingClientRect().left+window.scrollX;

    clone.style.top = posTop+'px';
    clone.style.left = posLeft+'px';
    clone.style.position = 'absolute';
    clone.style.transform = 'scale(1)';
    //append clone to body
    document.body.appendChild(clone);
    //scale using window height or width?
    var scaleWidth = (window.innerWidth+posLeft)/width.replace('px','')*2;
    var scaleHeight = (window.innerHeight+posTop)/height.replace('px','')*2;
    var finalScale = (scaleHeight > scaleWidth) ? scaleHeight : scaleWidth;
    //how much should animation delay? 
    var delay = i/6;
    scaleItem(clone,finalScale,delay);

    //on last one... do this
    if(i==itemColors.length-1){
      setTimeout(function() {
        document.querySelector('body').style.backgroundColor = clone.style.backgroundColor;
      }, delay+1000);
      loadContentArea('/itempartial.html',delay+1000);
    }
  }

}

function loadContentArea (href,delay){
  $('.content-area').addClass('fadeOut');
  //TODO: Scroll to top
  setTimeout(function() {
    //TODO: fade out then in content area
    $('.content-area').load(href, function(){
      window.scrollTo(0,0);
      enableScroll();
      documentUpdate();
      $('.content-area').removeClass('fadeOut');
    });
  }, delay);
}

// FIXME: Fix so that transform is cross-browser (moz, etc.)
function scaleItem(item,finalScale,delay){
  //OPENING ANIMATION
  window.setTimeout(function(){
    item.style.transition = 'transform 1s ease-in-out '+delay+'s';
    item.style.transform = 'scale('+finalScale+')';
  },0);

  window.setTimeout(function(){
    item.remove();
  },delay+1000);

}


/*----------  HANDLERS  ----------*/


function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
    e.preventDefault();
  e.returnValue = false;  
}

function preventDefaultForScrollKeys(e) {
  // left: 37, up: 38, right: 39, down: 40,
  // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
  var keys = {37: 1, 38: 1, 39: 1, 40: 1};
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

function disableScroll(){
  if (window.addEventListener) // older FF
    window.addEventListener('DOMMouseScroll', preventDefault, false);
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove  = preventDefault; // mobile
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