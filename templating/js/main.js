$('.item').draggable();

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
    } //'item' is now item div

    expandSelectedItem(item);
    return false;
  });
});

function expandSelectedItem(item) {
  //contains primary, secondary, tertiary divs
  var itemColors = item.querySelector('.item-colors').children;
  
  for (var i = 0; i < itemColors.length; i++) {
    //copy div and all the characteristics 
    var clone = itemColors[i].cloneNode(true);
    var existing = window.getComputedStyle(itemColors[i], null);
    var width = clone.style.width = existing.getPropertyValue('width');
    var height = clone.style.height = existing.getPropertyValue('height');
    clone.style.backgroundColor = existing.getPropertyValue('background-color');
    clone.style.top = itemColors[i].getBoundingClientRect().top+window.scrollY+'px';
    clone.style.left = itemColors[i].getBoundingClientRect().left+window.scrollX+'px';
    clone.style.position = 'absolute';
    clone.style.transform = 'scale(1)';
    //append clone to body
    document.body.appendChild(clone);
    //scale using window height or width?
    var scaleWidth = window.innerWidth/width.replace('px','')*2;
    var scaleHeight = window.innerHeight/height.replace('px','')*2;
    var finalScale = (scaleHeight > scaleWidth) ? scaleHeight : scaleWidth;
    //how much should animation delay? 
    var delay = i/6;
    scaleItem(clone,finalScale,delay);
  }
  
}

// FIXME: Fix so that transform is cross-browser (moz, etc.)
// FIXME: Update using CSS variables like --item-scale
// FIXME: Animation jumps on iPhone
function scaleItem(item,finalScale,delay){
  //OPENING ANIMATION
  window.setTimeout(function(){
    document.body.style.position = 'fixed';
    item.style.transition = 'transform 1s ease-in-out '+delay+'s';
    // document.documentElement.style.setProperty('--item-transform', 'scale('+finalScale+')');
    item.style.transform = 'scale('+finalScale+')';
  },0);

}