//TODO: 
//Check @include in userscripts
//store in cache, edit capabilities
//add script userscript
var debug = false;
var aliases = {
    greasekit: {
        id: 'greasekit',
        js: getLocalScript('res/greasekit.js'),
        cached: !debug,
        keepexisting: true
    },
    xwindow: {
        id: 'xwindow',
        js: getLocalScript('res/xwindow.js')
    },
    userscript: {
        id: 'userscript$version',
        js: 'http://userscripts.org/scripts/source/$version.user.js',
        cached: !debug
    },
    jquery: [{
        id: 'jq',
        js: 'http://ajax.googleapis.com/ajax/libs/jquery/$version/jquery.min.js'
    }, {
        id: 'jqboot',
        js: chrome.extension.getURL('res/jquery/bootstrap.js') + '?' + Math.round(Math.random() * 9999 + 1)
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
        id: 'jlinq',
        last: '2.2.1',
        js: "http://www.hugoware.net/Downloads/Get/jLinq-$version.js"
    }]
};

var reKeyword = /\/\/\s*@(\w+)\s*(.*)$/mg;
var reKeywordParameters = /([^\s]*)\s*([^\s]*)\s*([^\s]*)\s*([^\s]*)\s*(.*)/;
var reCss = /\/\/@css_start\n\/*(.*)*\/\n\/\/@css_end/mg;
var reCssUrl = /\/\/@css\s*(.*)/mg;
var scripts = 300;
function autoUpdate(coda, asjs, cb){
    var defertime = 200, i = 0, rq, alias, virtualStorage = false, code = coda, keywords = [];
    while ((rq = reKeyword.exec(code))) {
        var key = rq[1];
        if (key === 'require') {
            var line = rq[2];
            var m = reKeywordParameters.exec(line);
            var url = m[1], version = m[2], id = m[3], shortcut = m[4]; //could be an alias
            //console.log('require ' + url);
            //console.log(m);
            if (url) {
                var time = 0;
                if (m[5]) {
                    try {
                        time = parseInt(m[5], 10);
                    } catch (e) {
                    }
                }
                keywords.push({
                    url: url,
                    version: version,
                    id: id,
                    shortcut: shortcut,
                    asjs: asjs,
                    time: time
                });
            }
        } else if (key === 'include') {
            //TODO....
        } else if (key === 'defer') {
            var time = rq[2];
            try {
                defertime = parseInt(time, 10);
            } catch (e) {
            }
            
        } else if (key === 'storage') {
            var line = rq[2];
            var m = reKeywordParameters.exec(line);
            var storage = m[1];
            //console.log('storage ' + storage);
            virtualStorage = (storage === 'virtual');
        } else if (key === 'css') {
			//remote css
			var rcu = reCssUrl.exec(rq[2]);
			if (rcu && rcu[1]){
				keywords.push({
                    url: rcu[1],
                    asjs: false,
					astext:false
                });
			}
		} else if (key === 'css_start') {
            //local css
			var rc = reCss.exec(code);
			if (rc && rc[1]){
				//var style= rc[1].replace(/[\r\n]/, '').replace(/^\/*/,'').replace(/*\/$/,'');
				var style= rc[1].replace(/[\r\n]/, '');
				keywords.push({
                    url: style,
                    asjs: false,
					astext:true
                });
			}
        }
    }
    
    if (virtualStorage) {
        initVirtualStorage();
    }
    
    //TODO replace loop using event event recursion
    $(keywords).slowEach(defertime, function(i, k){
        //$.each(keywords, function(i, k){
        if (k.asjs) {
            //could be an alias
            var alias = aliases[k.url];
            if (alias) {
                alias.keepexisting = true;
                addLibraries(alias, k.version, k.shortcut);
            } else {
                addScript(k.url, k.id);
            }
        } else {
            addStyle(k.url, k.id, k.astext);
        }
    });
    
    if (asjs) {
        code = 'window.tHema=window.tHema||{};\n' + code;
    }
    
    //TODO : replace timeout by previous looping on events
    setTimeout(function(){
        cb(code);
    }, defertime);
    
    //return code;
}

function fv(text, o){
    var v = text;
    if (o) {
        $.each(o, function(i, a){
            v = v.replace('$' + i, a);
        })
    }
    return v;
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
    if (isArray(alias)) {
        $.each(alias, function(i, a){
            addLibraries(a, version, shortcut);
        });
        return;
    }
    
    var o = {
        version: version || alias.last || '1',
        shortcut: shortcut || '$'
    };
    
    var id = fv(alias.id, o);
    
    var url, code;
    if (alias.css) {
        url = fv(alias.css, o);
        addStyle(url, id, false, false, alias);
    }
    if (alias.js) {
        url = fv(alias.js, o);
        addScript(url, id, false, false, alias);
    }
    if (alias.jsx) {
        code = fv(alias.jsx, o);
        addScript(code, id + 'x', true, false, alias);
    }
}


function setval(el, text, astext){
    if (astext) {
        el.text(text);
    } else {
        el.attr('href', text);
    }
}

var modebg = false;
var PREFIX = '__tHema_';
function addStyle(styles, lid, astext, cb, cfg){
    if (!styles) {
        return;
    }
    cfg = cfg || {};
    if (modebg) {
        var o = (astext) ? {
            code: styles
        } : {
            file: styles
        };
        o.tab = mytabId;
        req('addcss', cb, o);
    } else {
        var id = PREFIX + lid;
        var el = $('#' + id);
        if (el && el.length > 0) {
            if (!cfg.once) {
                setval(el, styles, astext);
            }
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
                el.appendTo($('head'));
            } else {
                var pid = 'css_' + (lid || styles);
                if (cfg.cached) {
                    _get(pid, function(o){
                        if (o.value) {
                            //cached
                            el.text(o.value);
                        } else {
                            el.attr('href', styles);
                            requesttext(styles, function(code){
                                if (code) {
                                    _set(pid, code);
                                }
                            });
                        }
                        el.appendTo($('head'));
                    });
                } else {
                    el.attr('href', styles);
                    el.appendTo($('head'));
                }
            }
            
        }
    }
}

var addedScripts = {};
function addScript(scripts, lid, astext, cb, cfg){
    if (!scripts) {
        return;
    }
    cfg = cfg || {};
    
    //console.log('addScript ' + scripts);
    if (modebg) {
        var o = (astext) ? {
            code: scripts
        } : {
            file: scripts
        };
        o.tab = mytabId;
        req('addjs', cb, o);
    } else {
        var id = PREFIX + lid;
        var el = $('#' + id);
        if (addedScripts[lid] || (el && el.length > 0)) {
            if (cfg.keepexisting) {
                return;
            } else {
                el.remove();
            }
        }
        
        addedScripts[lid] = true;
        el = $('<script type="text/javascript"></script>');
        if (id) {
            el.attr('id', id);
        }
        if (astext) {
            el.text(fixcode(scripts));
            el.appendTo($('head'));
        } else {
            var pid = 'js_' + (lid || scripts);
            if (cfg.cached) {
                //el.attr('defer', 'defer');//useful?
                _get(pid, function(o){
                    if (o.value) {
                        //cached
                        if (cfg.defer) {
                            setTimeout(function(){
                                el.text(o.value);
                            }, cfg.defer || 0);
                        } else {
                            el.text(o.value);
                        }
                    } else {
                        el.attr('src', scripts);
                        requesttext(scripts, function(code){
                            if (code) {
                                _set(pid, fixcode(code));
                            }
                        });
                    }
                    el.appendTo($('head'));
                });
            } else {
                setTimeout(function(){
                    el.attr('src', scripts);
                    el.appendTo($('head'));
                }, cfg.defer || 0);
            }
        }
    }
}


function getLocalScript(path){
    var url = chrome.extension.getURL(path);
    if (debug) {
        url += '?' + Math.round(Math.random() * 9999 + 1);
    }
    return url;
}

function fixcode(code){
    //toSource
    //return code/.replace(/\.toSource\(\)/g,'');
    return code;
}


/**
 * Virtual storage
 */
var initOnced = false;
function initVirtualStorage(){
    if (initOnced) {
        return;
    }
    initOnced = true;
    
    //Create virtual storage placeholder
    $('<div id="_vs" style="display:none;"><div id="_vs_set"></div><div id="_vs_get"></div></div>').appendTo($('body'));
    
    $('#_vs_set').bind('DOMNodeInserted', function(e){
        /*if ($(e.target).attr('alt')!=='saved'){
         setvalue(e.target.className, e.target.innerHTML);
         $(e.target).attr('alt','saved');
         }*/
        var name = e.target.className;
        setvalue(name, e.target.innerHTML);
        setDOMvalueOnGet(name);
        setTimeout(function(){
            $(e.target).remove();
        }, 1);
    });
    $('#_vs_get').bind('DOMNodeInserted', function(e){
        setDOMvalueOnGet(e.target.className);
    });
    
    //Pooling now
    dumpValues();
    setInterval(dumpValues, 1000);
}

//update localstorage into DOM
function dumpValues(){
    $.each(localStorage, function(i, o){
        var name = localStorage.key(i);
        if (/^__vs_/.test(name)) {
            setDOMvalueOnGet(name.replace(/^__vs_/, ''));
        }
    });
}

var memcache = {};
function setDOMvalueOnGet(name){
    var value = getvalue(name);
    //no DOM change if no change 
    if ((typeof memcache[name] === 'undefined') || (memcache[name] !== value)) {
        memcache[name] = JSON.stringify(value);
        var el = $('#_vs_get a[class="' + name + '"]');
        if (typeof value !== 'undefined') {
            if (el.length > 0) {
                el.html(memcache[name]);
            } else {
                $('#_vs_get').append('<a class="' + name + '">' + memcache[name] + '</a>');
            }
        }
    }
}

var PREFIX_STORAGE = '__vs_';
function setvalue(name, value){
    var v = value;
    if (typeof value === 'object') {
        v = JSON.stringify(value);
    }
    localStorage.setItem(PREFIX_STORAGE + name, v);
}
function getvalue(name, defaut){
    var value = localStorage.getItem(PREFIX_STORAGE + name);
    try {
        value = JSON.parse(value);
    } catch (e) {
    
    }
    return value || defaut;
}
