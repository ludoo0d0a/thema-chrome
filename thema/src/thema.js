var aliases = {
    jquery: [{
        id: 'jq',
        js: 'http://ajax.googleapis.com/ajax/libs/jquery/$version/jquery.min.js'
    },{
        id: 'jqboot',
        js: chrome.extension.getURL('res/jquery/bootstrap.js')+'?'+Math.round(Math.random()*9999+1)
    }],
    jqueryui: [{
        id: 'jqui',
        js: "http://ajax.googleapis.com/ajax/libs/jqueryui/$version/jquery-ui.min.js",
        css: "http://ajax.googleapis.com/ajax/libs/jqueryui/$version/themes/base/jquery-ui.css"
    }],
    prototype: [{
        id: 'prototype',
        js: "http://ajax.googleapis.com/ajax/libs/prototype/$version/prototype.js"
    }],
    scriptaculous: [{
        id: 'scriptaculous',
        js: "http://ajax.googleapis.com/ajax/libs/scriptaculous/$version/scriptaculous.js"
    }],
    yui: [{
        id: 'yui',
        js: "http://ajax.googleapis.com/ajax/libs/yui/$version/build/yuiloader/yuiloader-min.js"
    }],
    mootools: [{
        id: 'mootools',
        js: "http://ajax.googleapis.com/ajax/libs/mootools/$version/mootools-yui-compressed.js"
    }],
    dojo: [{
        id: 'dojo',
        js: "http://ajax.googleapis.com/ajax/libs/dojo/$version/dojo/dojo.xd.js"
    }],
    extjs: [{
        id: 'extjs',
        js: "http://ajax.googleapis.com/ajax/libs/ext-core/$version/ext-core.js",
        css: "http://extjs.cachefly.net/ext-$version/resources/css/ext-all.css"
    }],
	jlinq: [{
        id: 'extjs',
		last:'2.2.1',
        js: "http://www.hugoware.net/Downloads/Get/jLinq-$version.js"        
    }]
};

var reRequire = /\/\/\s*@require\s*(.*)$/mg;
var reRequireLine = /([^\s]*)\s*([^\s]*)\s*([^\s]*)\s*(.*)/;
//@require jquery 1.4.2 jq $
//@require http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js jq
function autoUpdate(coda, asjs){
    var i=0,rq,alias, code = coda;
	while ((rq = reRequire.exec(code))){
		var line = rq[1];
		var m = reRequireLine.exec(line);
		var url = m[1], version = m[2], id = m[3], shortcut = m[4]; //could be an alias
        console.log('require ' + url);
		console.log(m);
		if (url) {
			if (asjs) {
				//could be an alias
				var alias = aliases[url];
				if (alias) {
					addLibraries(alias, version, shortcut);
				} else {
					addScript(url, id);
				}
			} else {
				addStyle(url, id);
			}
		}
    }
	if (asjs) {
		code = 'window.tHema=window.tHema||{};\n' + code;
	}
    return code;
}


/**
 * Samples of monitoring (ala Aardvardk)
 */
/*
 $jQ('div').hover(function(){
 $jQ(this).css('border', '1px solid red');
 },function(){
 $jQ(this).css('border', '');
 });
 */
function addLibraries(alias, version, shortcut){
    version = version || alias.last || '1';
    shortcut = shortcut || '$';
    
    $.each(alias, function(i, o){
        var url, code;
        if (o.css) {
            url = o.css.replace('$version', version);
            addStyle(url, o.id);
        }
        if (o.js) {
            url = o.js.replace('$version', version);
            addScript(url, o.id);
        }
        if (o.jsx) {
            code = o.jsx.replace('$shortcut', shortcut);
            addScript(code, o.id + 'x', true);
        }
    });
}


function setval(el, text, astext){
    if (astext) {
        el.text(text);
    } else {
        el.attr('href', text);
    }
}

var modebg=false;
var PREFIX = '__tHema_';
function addStyle(styles, lid, astext, cb){
	if (modebg) {
		var o=(astext)?{code:styles}:{file:styles};
		o.tab=mytabId;
		req('addcss', cb, o);
	} else {
		var id = PREFIX + lid;
		var el = $('#' + id);
		if (el && el.length > 0) {
			setval(el, styles, astext);
		} else {
			if (astext) {
				el = $('<style type="text/css"></style>');
			} else {
				el = $('<link type="text/css" rel="stylesheet"></link>');
			}
			if (id) {
				el.attr('id', id);
			}
			
			if (astext) {
				el.text(styles);
			} else {
				el.attr('href', styles);
			}
			
			el.appendTo($('head'));
		}
	}
}

function addScript(scripts, lid, astext, cb){
    console.log('addScript '+scripts);
	if (modebg) {
		var o= (astext) ? {code: scripts} : {file: scripts};
		o.tab=mytabId;
		req('addjs', cb, o);
	} else {
		var id = PREFIX + lid;
		var el = $('#' + id);
		if (el && el.length > 0) {
			el.remove();
		}
		
		el = $('<script type="text/javascript"></script>');
		if (id) {
			el.attr('id', id);
		}
		if (astext) {
			el.text(scripts);
		} else {
			el.attr('src', scripts);
		}
		
		el.appendTo($('head'));
	}
    
}
