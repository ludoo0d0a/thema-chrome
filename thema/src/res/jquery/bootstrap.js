console.log('bootstrap');
window.tHema = window.tHema || {};
console.log(tHema);
tHema.wait = function(fn, count, init){
	var o = fn(),count=count||0;
	if (typeof o === 'undefined') {
		if (count < 50) {
			window.setTimeout(function(){
				tHema.wait(fn, ++count, init);
			}, 100);
		}else{
			console.error('Failed to load jQuery');
		}
    } else {
		if (typeof init === 'function') {
			init();
		}
        if (tHema.onLoad) {
			jQuery(tHema.onLoad);
        }
		if (tHema.onReady) {
			jQuery(document).ready(tHema.onReady);
        }
    }
};

//Wait jquery
tHema.wait(function(){return jQuery;}, function(){jQuery.noConflict();});


