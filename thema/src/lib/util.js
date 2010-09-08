
function getElements(xpath, context){
    var doc = (context) ? context.ownerDocument : document;
    var r = doc.evaluate(xpath, (context || doc), null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, l = r.snapshotLength, res = new Array(l); i < l; i++) {
        res[i] = r.snapshotItem(i);
    }
    return res;
}

function serializeXml(nodes){
    var html = '';
    $.each(nodes, function(i, node){
        html += node.outerHTML;
    });
    return html;
}

function isArray(obj){
    return (obj && obj.constructor == Array);
}
var recreateScript = false;
function addcss(script, inline, id, cb, scope, time){
	addResource('css', script, inline, id, cb, scope, time);
}	
function addjs(script, inline, id, cb, scope, time){
	addResource('js', script, inline, id, cb, scope, time);
}
function addResource(type, code, inline, id, cb, scope, time){
    var prev = $('#' + id), el,cfg={};
	
	if (type === 'js') {
		cfg.tag ='<script type="text/javascript">';
		cfg.attr='js';
	} else {
		if (inline) {
			cfg.tag = '<style type="text/css">';
		} else {
			cfg.tag = '<link rel="stylesheet">';
			cfg.attr='href';
		}
	}
		
	if (recreateScript){
		el = $(cfg.tag);
		if (prev.length > 0) {
	        //Ensure no conflict in IDs
	        prev.removeAttr('id');
	    }
	} else{
		el = prev;
	}
    if (inline) {
		if (cfg.attr) {
			el.removeAttr(cfg.attr);
		}
		el.text(code);
    } else {
        el.text('');
		if (cfg.attr) {
			el.attr(cfg.attr, code);
		}
    }
	if (recreateScript) {
		if (id) {
			el.attr('id', id);
		}
		if (prev.length > 0) {
			console.log(el[0]);
			console.log(prev[0]);
			el.insertAfter(prev);
		} else {
			el.appendTo($('head')[0]);
		}
		
		if (prev.length > 0) {
			//remove it
			prev.remove();
		}
	}
    
    if (cb) {
        window.setTimeout(function(){
            cb.call(scope || this);
        }, time || 500);
    }
}

function getSize(o){
    var c = 0;
    $.each(o, function(i, a){
        c++;
    });
    return c;
}

function getAllScripts(){
	return getAllFiles('script', 'js', 'src');
}

function getAllStyles(){
	var links = getAllFiles('link[rel="stylesheet"]', 'css', 'href');
	var styles = getAllFiles('style', 'css', '');
	$.extend(styles,links);
	return styles;
}

var iu = 20;
function getAllFiles(sel,ext, attr){
    var  files = {};
    var urlpage = window.location.href;
	var reExt = new RegExp("\."+ext+"$");
    if (reExt.test(urlpage)) {
        var id = 'tH'+ext+'_' + (++iu);
		files[id] = {
            file:true,
			url: urlpage
        };
    } else {
        $(sel).each(function(i, s){
            s = $(s);
            var url = (attr)?s.attr(attr):'';
            var id = s.attr('id');
            if (!id) {
                id = 'tH'+ext+'_' + (++iu);
                s.attr('id', id);
            }
            if (url) {
                files[id] = {
                    url: absoluteUrl(url, urlpage)
                };
            } else {
                files[id] = {
                    text: s.text()
                };
            }
        });
    }
    return files;
}

function removeTrailingSlash(text){
    return text.replace(/\/*$/, '');
}

function getUrlDomain(url){
    var p = parseUri(url);
    return p.authority;
}

function getUrlBase(url){
    var p = parseUri(url);
    return removeTrailingSlash(p.protocol + '://' + p.authority + p.directory);
}

function absoluteUrl(url, urlpage){
    var u = url;
	urlpage = urlpage || window.location.href;
    if (/^\//.test(url)) {
        //add domain
        var p = parseUri(urlpage);
        u = removeTrailingSlash(p.protocol + '://' + p.authority) + url;
    } else if (/^http/.test(url)) {
        //absolute
        u = url;
    } else {
        //relative
        url = url.replace(/^\.\//, '').replace(/^\/+/, '');//remove starting dot or slash
        var p = parseUri(urlpage);
        u = removeTrailingSlash(p.protocol + '://' + p.authority + p.directory) + '/' + url;
    }
	
	//remove 2 followings dots (upper dir)
	while(/\.\.\//.test(u)){
		u =u.replace(/\/[^\/]*\/\.\./, '');
	}
	
    return u;
}

//http://snipplr.com/view/9649/escape-regular-expression-characters-in-string/
//http://simonwillison.net/2006/Jan/20/escape/
var re_encodeRE = new RegExp("[.+?|()\\[\\]{}\\\\]", "g"); // .+?|()[]{}\
function encodeRE(s){
    return s.replace(re_encodeRE, "\\$&").replace(/\s/g, '\\s').replace(/\*/g, '.*');
}

jQuery.fn.slowEach = function( interval, callback ) { 
        var array = this; 
        if( ! array.length ) return; 
        var i = 0; 
        next(); 
        function next() { 
            if( callback.call( array[i], i, array[i] ) !== false ) 
                if( ++i < array.length ) 
                    setTimeout( next, interval ); 
        } 
}; 