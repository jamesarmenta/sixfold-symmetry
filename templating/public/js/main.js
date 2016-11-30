
var slider = document.getElementById('slider');
window.mySwipe = Swipe(slider, {
  continuous: true,
  speed: 1,
});


const items = Array.from(document.querySelectorAll('.item'));

items.forEach(function(item) {
  item.addEventListener('click', function(event) {
    event.preventDefault();
    var item = event.target;

    while (!item.classList.contains('item')) {
      item = item.parentNode;
    } 

    expandSelectedItem(item);
    return false;
  });
});

function expandSelectedItem(item) {
  var itemColors = item.querySelector('.item-colors').children;

    for (var i = 0; i < itemColors.length; i++) {
    var clone = itemColors[i].cloneNode(true);
    var existing = window.getComputedStyle(itemColors[i], null);
    var width = clone.style.width = existing.getPropertyValue('width');
    var height = clone.style.height = existing.getPropertyValue('height');
    clone.style.backgroundColor = existing.getPropertyValue('background-color');
    clone.style.top = itemColors[i].getBoundingClientRect().top+window.scrollY+'px';
    clone.style.left = itemColors[i].getBoundingClientRect().left+window.scrollX+'px';
    clone.style.position = 'absolute';
    clone.style.transform = 'scale(1)';
    document.body.appendChild(clone);
    var scaleWidth = window.innerWidth/width.replace('px','')*2;
    var scaleHeight = window.innerHeight/height.replace('px','')*2;
    var finalScale = (scaleHeight > scaleWidth) ? scaleHeight : scaleWidth;
    var delay = i/6;
    scaleItem(clone,finalScale,delay);
  }

  }

function scaleItem(item,finalScale,delay){
  window.setTimeout(function(){
    document.body.style.position = 'fixed';
    item.style.transition = 'transform 1s ease-in-out '+delay+'s';
    item.style.transform = 'scale('+finalScale+')';
  },0);

}