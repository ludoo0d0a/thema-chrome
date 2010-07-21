/**
 * tHema script Sample
 */
//@require jquery
tHema.onReady = function(){
   console.log('jQuery ' + jQuery.fn.jquery + ' loaded!!');
   
   setInterval(function(){
   	jQuery('img,input,select,textarea').toggle();
   },2000);
}

