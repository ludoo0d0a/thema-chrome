/*
 * GreaseKit
 * Ensure compatibility for GreaseMonkey scripts
 *
 */
var _vson=false;
if (typeof GM_getValue === "undefined") {
    GM_getValue = function(name, def){
        var value;
		if ($('#_vs').length > 0) {
			var el = $('#_vs_get a[class="' + name + '"]');
            if (el.length > 0) {
                value= el.html();
            } else {
                value= def;
            }
        } else {
            var nameEQ = escape("_greasekit_" + name) + "=", ca = document.cookie.split(';');
            for (var i = 0, c; i < ca.length; i++) {
                c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) === 0) {
                    value = unescape(c.substring(nameEQ.length, c.length));
                    break;
                }
            }
            if (typeof value === 'undefined' && typeof def !== 'undefined') {
                value = def;
            }
        }
            try {
                value = JSON.parse(value);
            } catch (e) {
            }
            return value;
    }
}
if (typeof GM_setValue === "undefined") {
    GM_setValue = function(name, value, options){
        if (typeof value === 'object') {
                value = JSON.stringify(value);
        }
		if ($('#_vs').length > 0) {
            $('#_vs_set').append('<a class="' + name + '">' + value + '</a>');
        } else {
            options = options || {};
            if (options.expiresInOneYear) {
                var today = new Date();
                today.setFullYear(today.getFullYear() + 1, today.getMonth, today.getDay());
                options.expires = today;
            }            
            var curCookie = escape("_greasekit_" + name) +
            "=" +
            escape(value) +
            ((options.expires) ? "; expires=" +
            options.expires.toGMTString() : "") +
            ((options.path) ? "; path=" + options.path : "") +
            ((options.domain) ? "; domain=" + options.domain : "") +
            ((options.secure) ? "; secure" : "");
            document.cookie = curCookie;
        }
    }
}
if (typeof GM_deleteValue === "undefined") {
    GM_deleteValue = function(name){
    };
}
if (typeof GM_listValues === "undefined") {
    GM_listValues = function(name){
    };
}

if (typeof GM_getResourceURL === "undefined") {
    GM_getResourceURL = function(name){
        return (window.tHema) ? window.tHema.resources : false;
    };
}
if (typeof GM_getResourceText === "undefined") {
    GM_getResourceText = function(name){
        return (window.tHema) ? window.tHema.resources : false;
    };
}
if (typeof GM_xmlhttpRequest === "undefined") {
    GM_xmlhttpRequest = function(a){
        var xhr = new XMLHttpRequest();
        var method = a.method || 'get';
        method = method.toLowerCase();
        var url = a.url;
        if (a.parameters && (method === 'get')) {
            var params = [];
            for (var k in a.parameters) {
                params.push(k + '=' + encodeURIComponent(a.parameters[k]));
            }
            var sep = (url.indexOf('?') > 0) ? '&' : '?';
            url += sep + params.join('&');
        }
        xhr.open(method, url, true);
        //headers
        if (a.headers) {
            for (var kh in a.headers) {
                xhr.setRequestHeader(kh, a.headers[kh]);
            }
        }
        //a['onload']=true;//force onload
        var fns = ['readystatechange', 'error', 'load'];
        var xpath = a.xpath;
        for (var i = 0, len = fns.length; i < len; i++) {
            var name = fns[i];
            if (a['on' + name]) {
                var f = '' + name;
                xhr['on' + f] = function(o){
                    var xhr = o.target;
                    if (xhr) {
                        if (typeof a['on' + f] === "function") {
                            var res = enhanceResponse(a, xhr);
                            a['on' + f].call(this, res);
                        }
                    }
                };
            }
        }
        try {
            var typesSend = {
                post: true,
                put: true,
                'delete': true
            };
            var d = typesSend[method] ? a.data : null;
            if (d && typeof d !== 'string') {
                d = serializePost(d);
            }
            xhr.send(d);
        } catch (e) {
            console.log('Error catched on xhr');
            var o = {
                message: a.callback || "requestdone",
                responseText: e.message || 'Error',
                status: (e.name || '') + ' ' + (e.code || 0),
                statusText: (e.name || '') + ' ' + (e.code || 0),
                action: 'error',
                error: e
            };
            if (typeof a.onerror === "function") {
                a.onerror.call(this, o);
            }
        }
    };
}

if (typeof GM_addStyle === "undefined") {
    GM_addStyle = function(styles){
        var oStyle = document.createElement("style");
        oStyle.setAttribute("type", "text\/css");
        oStyle.appendChild(document.createTextNode(styles));
        document.getElementsByTagName("head")[0].appendChild(oStyle);
    };
}

if (typeof GM_addScript === "undefined") {
    GM_addScript = function(script, remote, cb, cbonerror, scope, time){
        //var id = script.replace(/[\.:-_\/\\]/g, '');
        var id = script;
        var s = document.getElementById(id);
        if (s) {
            if (cbonerror && cb) {
                cb.call(this);
            }
        } else {
            if (remote) {
                GM_xmlhttpRequest({
                    method: 'get',
                    url: script,
                    onload: function(r){
                        if (remote === 'inline') {
                            GM_addjs(script, true, id, cb, scope, time);
                        } else {
                            eval(r.responseText);
                            if (cb) {
                                cb.call(scope || this);
                            }
                        }
                    },
                    onerror: function(r){
                        if (cbonerror && cb) {
                            cb.call(scope || this);
                        }
                        console.error('Error on loading Javascript ' + script);
                    }
                });
            } else {
                GM_addjs(script, false, id, cb, scope, time);
            }
        }
    };
}
if (typeof GM_addjs === "undefined") {
    GM_addjs = function(script, inline, id, cb, scope, time){
        var el = document.createElement("script");
        el.setAttribute("type", "text\/javascript");
        if (inline) {
            el.innerText = script;
        } else {
            el.setAttribute("src", script);
        }
        if (id) {
            el.setAttribute("id", id);
        }
        document.getElementsByTagName("head")[0].appendChild(el);
        if (cb) {
            window.setTimeout(function(){
                cb.call(scope || this);
            }, time || 500);
        }
    };
}

if (typeof GM_log === "undefined") {
    GM_log = function(log){
        console.log(log);
    };
}

if (typeof GM_registerMenuCommand === "undefined") {
    GM_registerMenuCommand = function(a, b){
        //
    };
}

if (typeof GM_openInTab === "undefined") {
    GM_openInTab = function(url, name){
        window.open(url, name);
    };
}

if (typeof unsafeWindow === "undefined") {
    unsafeWindow = window;
}

if (typeof Array.forEach === "undefined") {
    Array.forEach = function(a, f){
        Array.prototype.forEach.call(a, f);
    };
}
if (typeof Array.slice === "undefined") {
    Array.slice = function(a){
        return Array.prototype.slice.call(a);
    };
}

if (typeof window.uneval === "undefined") {
    window.uneval = function(a){
        return (JSON.stringify(a)) || '';
    };
}

if (typeof window.eval === "undefined") {
    window.eval = function(a){
        var o;
        console.log('eval for ' + a);
        try {
            o = JSON.parse(a);
            console.log('eval result : ');
            console.log(o);
        } catch (e) {
            console.log('ERROR in eval for ' + a);
            console.error(e);
        }
        return o;
    };
}


if (typeof(this['clone']) !== 'function') {
    clone = function(o){
        try {
            return eval(uneval(o));
        } catch (e) {
            throw (e);
        }
    };
}

/*
 * From jQuery
 */
function serializePost(a, traditional){
    var e = encodeURIComponent, s = [];
    if (isArray(a) || a.jquery) {
        forEeach(a, function(){
            add(this.name, this.value);
        });
    } else {
        for (var prefix in a) {
            buildParams(prefix, a[prefix]);
        }
    }
    return s.join("&").replace(/%20/g, "+");
    
    function buildParams(prefix, obj){
        if (isArray(obj)) {
            iterate(obj, function(i, v){
                if (traditional || /\[\]$/.test(prefix)) {
                    add(prefix, v);
                } else {
                    buildParams(prefix + "[" + (typeof v === "object" || isArray(v) ? i : "") + "]", v);
                }
            });
            
        } else if (!traditional && obj !== null && typeof obj === "object") {
            // Serialize object item.
            iterate(obj, function(k, v){
                buildParams(prefix + "[" + k + "]", v);
            });
            
        } else {
            // Serialize scalar item.
            add(prefix, obj);
        }
    }
    
    function add(key, value){
        // If value is a function, invoke it and return its value
        if (isFunction(value)) {
            value = value();
        }
        s[s.length] = e(key) + "=" + e(value);
    }
}

function enhanceResponse(a, res){
    if (a.dataType === 'json' && res.responseText) {
        try {
            res.responseJson = JSON.parse(res.responseText);
        } catch (e) {
        }
    }
    if (a.xpath && xhr.responseXML) {
        res.xml = serializeXml(getElements(a.xpath, xhr.responseXML));
    }
    return res;
}
