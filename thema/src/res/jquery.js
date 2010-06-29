/**
 * tHema script Sample
 */
//@require jquery //
tHema.onLoad = function(){
    jQuery(document).ready(function(){
        console.log('jQuery ' + jQuery.fn.jquery + ' loaded!!');
        
        function lightoff(){
            var els = jQuery(document.body).children();
            els.fadeOut(2000, function(){
                els.fadeIn(2000);
            });
        }
       //lightoff();
	   
	   setInterval(function(){
	   	jQuery('img,input,select,textarea').toggle();
	   },2000);
        
    });
}

