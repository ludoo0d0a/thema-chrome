
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

function getUrlDomain(url){
    var p = parseUri(url);
    return p.authority;
}

function isArray(obj){
    return (obj && obj.constructor == Array);
}

function addjs(script, inline, id, cb, scope, time){
    var prev = $('#' + id), el = $('<script type="text/javascript">');
    if (prev.length > 0) {
        //Ensure no conflict in IDs
        prev.removeAttr('id');
    }
    if (inline) {
        el.removeAttr('src').text(script);
    } else {
        el.text('').attr('src', script);
    }
    if (id) {
        el.attr('id', id);
    }
    if (prev.length > 0) {
        el.insertAfter(prev);
    } else {
        el.appendTo($('head')[0]);
    }
    
    if (prev.length > 0) {
        //remove it
        prev.remove();
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

var iu = 20;
function getAllScripts(){
    var  scripts = {};
    var urlpage = window.location.href;
    if (/\.js$/.test(urlpage)) {
        var id = 'tHs_' + (++iu);
		scripts[id] = {
            jsfile:true,
			url: urlpage
        };
    } else {
        $('script').each(function(i, s){
            s = $(s);
            var url = s.attr('src');
            var id = s.attr('id');
            if (!id) {
                id = 'tHs_' + (++iu);
                s.attr('id', id);
            }
            if (url) {
                scripts[id] = {
                    url: absoluteUrl(url, urlpage)
                };
            } else {
                scripts[id] = {
                    text: s.text()
                };
            }
        });
    }
    
    return scripts;
}

function removeTrailingSlash(text){
    return text.replace(/\/*$/, '');
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
        url = url.replace(/^[\.\/]+/, '');//remove statring dot or slash
        var p = parseUri(urlpage);
        u = removeTrailingSlash(p.protocol + '://' + p.authority + p.directory) + '/' + url;
    }
    return u;
}
/*
function resolveUrl(url, urlbase){
	urlbase = urlbase || window.location.href;
	var p = parseUri(urlpage);
	urlbase = removeTrailingSlash(p.protocol + '://' + p.authority + p.directory) + '/'
	
    //var res = noParameters(url);
    var res = url;
    
    //urlbase should ends with /
    if (!/\/$/.test(urlbase)) {
        urlbase += '/';
    }
    if (!/^http/.test(res)) {
        if (/^\//.test(res)) {
            var n = /^https?:\/\/[^\/]*\//.exec(urlbase);
            if (n && n[0]) {
                res = n[0] + res;
            }
        } else {
            //relative
            res = urlbase + res;
        }
        res = cleanback(res);
    }
    return res;
}

function cleanback(url){
    var res = url;
    var res = res.replace(/^:\/\//g, '/');
    var res = res.replace(/(\/[^\/]*\/\.\.)/g, '');
    return res;
}
*/