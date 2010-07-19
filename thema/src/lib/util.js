
function getElements(xpath, context){
    var doc = (context) ? context.ownerDocument : document;
    var r = doc.evaluate(xpath, (context || doc), null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, l = r.snapshotLength, res = new Array(l); i < l; i++) {
        res[i] = r.snapshotItem(i);
    }
    return res;
}

function serializeXml(nodes){
	var html='';
	$.each(nodes, function(i, node){
		html+=node.outerHTML;	
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
    var prev=$('#' + id), el = $('<script type="text/javascript">');	
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
	
	if (prev.length> 0) {
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
	var c= 0;
	$.each(o, function(i,a){
		c++;
	});
	return c;
}
