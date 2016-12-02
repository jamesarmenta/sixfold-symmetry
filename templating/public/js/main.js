
slickInit();
updateItems();


function documentUpdate(){
  slickInit();
  updateItems();
}


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



function updateItems(){
  $('.content-area > .item').each(function(){
    var range = 100;
    var minimumDistance = 20;
    var value = Math.floor(Math.random() * range)+minimumDistance;
    $(this).attr('data-parallax','{"y" : '+value+'}');
  });

  const items = Array.from(document.querySelectorAll('.item'));

  items.forEach(function(item) {

    item.addEventListener('click', function(event) {
      preventDefault(event);
      var item = event.target;

      while (!item.classList.contains('item')) {
        item = item.parentNode;
      } 

      disableScroll();
      expandSelectedItem(item);
    });
  });
}

function expandSelectedItem(item) {
  var itemColors = item.querySelector('.item-colors').children;

    for (var i = 0; i < itemColors.length; i++) {
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
    document.body.appendChild(clone);
    var scaleWidth = (window.innerWidth+posLeft)/width.replace('px','')*2;
    var scaleHeight = (window.innerHeight+posTop)/height.replace('px','')*2;
    var finalScale = (scaleHeight > scaleWidth) ? scaleHeight : scaleWidth;
    var delay = i/6;
    scaleItem(clone,finalScale,delay);

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
  setTimeout(function() {
    $('.content-area').load(href, function(){
      window.scrollTo(0,0);
      enableScroll();
      documentUpdate();
      $('.content-area').removeClass('fadeOut');
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