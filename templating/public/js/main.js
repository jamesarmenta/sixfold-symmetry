$('.item').draggable();

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
    var clone = itemColors[i].cloneNode(true),
        existing = window.getComputedStyle(itemColors[i], null);
        clone.style.width = width = existing.getPropertyValue('width'),
        clone.style.height = height = existing.getPropertyValue('height'),
        clone.style.backgroundColor = existing.getPropertyValue('background-color'),
        clone.style.top = top = itemColors[i].getBoundingClientRect().top+window.scrollY+'px',
        clone.style.left = left = itemColors[i].getBoundingClientRect().left+window.scrollX+'px',
        clone.style.position = 'absolute',
        clone.style.transform = 'scale(1)';
    document.body.appendChild(clone);
    var scaleWidth = document.documentElement.clientWidth/width.replace('px','')*3;
    var scaleHeight = document.documentElement.clientHeight/height.replace('px','')*3;
    var finalScale = (scaleHeight > scaleWidth) ? scaleHeight : scaleWidth;
    var delay = i/6;
    scaleItem(clone,finalScale,delay);
  }

  }

function scaleItem(item,finalScale,delay){
  window.setTimeout(function(){
    document.body.style.overflow = 'hidden';
    item.style.transition = 'transform 1s ease-in-out '+delay+'s';
    item.style.transform = 'scale('+finalScale+')';
  },0);

  window.setTimeout(function(){
    document.body.style.overflow = 'hidden';
    item.style.transition = 'transform 1s ease-in-out '+delay*-1+'s';
    item.style.transform = 'scale('+1+')';

    window.setTimeout(function(){
      item.remove();
      document.body.style.overflow = 'visible';
    },5000);

  },3500);

}