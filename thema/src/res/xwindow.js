var me = this;
var xWindow = function(){
    var ID = 'xWindow_';
    if ($('#' + ID).length == 0) {
        $("<div id='" + ID + "'></div>").appendTo($(document.body));
    }
	var inContentScripts = !!chrome.extension;
	console.log('xWindow ' + inContentScripts);
    var c = $('#' + ID), p1=(inContentScripts)?'cs':'wp', p2=(!inContentScripts)?'cs':'wp';
    
	//$('#xWindow_').trigger('xwindow', ['Game']);
    return {
        isInContentScripts: function(){
			return inContentScripts;
		},
		getJson: function(e){
            var o = {};
            $.each((e) ? window : window[e], function(i, a){
                if (i !== 'window') {
                    o[i] = a;
                }
            });
            return JSON.stringify(o);
        },
        postEvent: function(data){
            //from webpage to ext 
            if (typeof data !== 'string') {
                data = JSON.stringify(data);
            }
            c.text(data);
            c.trigger('xwindow', [data]);
			console.log("post xwindow"+p1+" "+data);
        },
        onEvent: function(data){
            c.bind('xwindow',{me:this} , function(e, a){
				e.stopImmediatePropagation();
				e.stopPropagation();
				//from ext to webpage
                console.log('bind xwindow'+p1+' fired '+data);
				//console.log(e);
				if(e.currentTarget){
					console.log(e.currentTarget.tagName + '#' + e.currentTarget.id + '.' + e.currentTarget.className );
				}
                console.log(a);
				
				//return data to ext
				var xw = e.data.me;
				var o = xw.getJson(a);
				console.log('object '+a);
				console.log(o);
				xw.postEvent(o);
            });
        }
    }
}


var xw = new xWindow();
if (xw.isInContentScripts()) {
    //in content scripts
    console.log('in content scripts');
    console.log(window.Game);
    xw.onEvent('onevent in contentScripts');
	var i =0;
    setTimeout(function(){
        xw.postEvent('Game');
    }, 5000);
} else {
    //in web page
    console.log('in web page');
    console.log(window.Game);
    xw.onEvent('onevent in webpage');
}

