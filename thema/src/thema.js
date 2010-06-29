var aliases = {
    jquery: [{
        id: 'jq',
        js: 'http://ajax.googleapis.com/ajax/libs/jquery/$version/jquery.min.js',
        jsx: "var tHema=tHema||{};tHema.waitjQuery=function(){console.log('in wait jquery');if(typeof jQuery==='undefined'){console.log('wait jquery');window.setTimeout(function(){console.log('recall waitjQuery');tHema.waitjQuery()},100)}else{console.log('jQuery.noConflict');jQuery.noConflict();if(tHema.onLoad){console.log('tHema.onLoad');tHema.onLoad()}else{console.log('ERROR tHema.onLoad');console.error('tHema.onLoad not found')}}};console.log('first call waitjQuery');tHema.waitjQuery();"
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
    }]

};

var reRequire = /\/\/\s*@require\s+([^\s]*)\s*([^\s]*)\s*([^\s]*)\s*(.*)\/\//;
//@require jquery 1.4.2 jq $
//@require http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js jq
function autoUpdate(coda, asjs){
    var alias, code = coda;
    var m = reRequire.exec(code);
    if (m) {
        var url = m[1], version = m[2], id = m[3], shortcut = m[4]; //could be an alias
        console.log('require ' + url);
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
        
        //code =  "jQuery(document).ready(function(){"+js+"})";
        //code =  "$(function(){"+js+"})";
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
    version = version || '1';
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

var PREFIX = '__tHema_';
function addStyle(styles, lid, astext){
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

function addScript(scripts, lid, astext){
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
