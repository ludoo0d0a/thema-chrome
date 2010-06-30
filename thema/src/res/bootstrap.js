var tHema = tHema || {};
tHema.waitjQuery = function(){
	if (typeof jQuery === 'undefined') {
		window.setTimeout(function(){
			tHema.waitjQuery();
		}, 100);
    } else {
		jQuery.noConflict();
        if (tHema.onLoad) {
			tHema.onLoad();
        } /*else {
			console.error('tHema.onLoad not found');
        }*/
    }
};
console.log('first call waitjQuery');
tHema.waitjQuery();


