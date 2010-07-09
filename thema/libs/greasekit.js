/*
 * GreaseKit 
 * Ensure compatibility for GreaseMonkey scripts
 * 
 */
if (typeof GM_getValue === "undefined") {
    GM_getValue = function(name, def){
        var value;
        var nameEQ = escape("_greasekit_" + name) + "=", ca = document.cookie.split(';');
        for (var i = 0, c; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') 
                c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) {
                value = unescape(c.substring(nameEQ.length, c.length));
                break;
            }
        }
        if (value === null && def !== null) {
            value = def;
        }
        return value;
    };
}
if (typeof GM_setValue === "undefined") {
    GM_setValue = function(name, value, options){
        options = (options || {});
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
    };
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
		return (window.tHema)?window.tHema.resources:false;
    };
}
if (typeof GM_getResourceText === "undefined") {
    GM_getResourceText = function(name){
		return (window.tHema)?window.tHema.resources:false;
    };
}
if (typeof GM_xmlhttpRequest === "undefined") {
    GM_xmlhttpRequest = function(o){
        o.method = o.method.toUpperCase() || "GET";
        if (!o.url) {
            throw ("GM_xmlhttpRequest requires an URL.");
            return;
        }
        var om = o;
        accessSecure("request", o, function(a){
            if (a.message === (om.callback || "requestdone")) {
                if (a.action === "onload") {
                    if (typeof om.onload == "function") {
                        om.onload(a);
                    }
                } else if (a.action === "onreadystatechange") {
                    if (typeof om.onreadystatechange == "function") {
                        om.onreadystatechange(a);
                    }
                } else if (a.action === "onerror") {
                    GM_log('error: ' + a.responseText);
                    if (typeof om.onerror == "function") {
                        om.onerror(a);
                    }
                }
            }
        });
    };
}

if (typeof GM_addStyle === "undefined") {
    GM_addStyle = function (styles){
        var oStyle = document.createElement("style");
        oStyle.setAttribute("type", "text\/css");
        oStyle.appendChild(document.createTextNode(styles));
        document.getElementsByTagName("head")[0].appendChild(oStyle);
    }
}

if (typeof GM_addScript === "undefined") {
    GM_addScript =function(script, remote, cb, cbonerror, scope, time){
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
    }
}
if (typeof GM_addScript === "undefined") {
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
    }
}

if (typeof GM_log === "undefined") {
    GM_log = function (log){
        console.log(log);
    }
}

if (typeof GM_registerMenuCommand === "undefined") {
    GM_registerMenuCommand = function(a, b){
        //
    }
}

if (typeof GM_openInTab === "undefined") {
    GM_openInTab = function(url, name){
        window.open(url, name);
    };
}

if (typeof unsafeWindow === "undefined") {
    unsafeWindow = window;
}
