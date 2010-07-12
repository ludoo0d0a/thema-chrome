
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
	return p.protocol+'//'+p.authority;
}
