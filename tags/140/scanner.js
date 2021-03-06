req('profiles', function(profiles){
    var url = window.location.href;
    $.each(profiles, function(id, p){
        if (p && p.url) {
            $.each(p.url, function(i, u){
                var re = new RegExp(encodeRE(u));
                if (re.test(url)) {
                    //console.log('Apply profile ' + id + ' / ' + u);
                    apply(p);
                }
            });
        }
    });
});

function autoIntall(){
    var source = window.location.href;
    if (/^https?:\/\/(www\.)?userscripts.org/.test(source)) {
        var l = $('#install_script a.userjs');
        l.hide().after($('<a href="#" title="Install as tHema script" class="userjs">Install</a>').bind('click', function(e){
            e.stopPropagation();
            var name = $('#details .title').text();
            if (confirm('Install tHema script :\n' + name + ' ?')) {
                var url = l.attr('href');
                var m = /(\d+).user.js$/.exec(url);
                if (m && m[1]) {
                    var id = m[1];
                    req('userscript', function(){
                    }, {
                        url: url,
                        name: name,
                        source: source,
                        id: id
                    });
                    
                }
            }
        }));
    }
}

req('get', function(a){
    if (a.value) {
        autoIntall();
    }
}, {
    name: 'autoinstall'
});

/*
var port = chrome.extension.connect({name: "popup_tHema"});

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    sendResponse({counter: request.counter+1});
  });
*/
function sendMessage(msg){
	/*if (port) {
		port.postMessage({
			message: 'info',
			text: msg
		});
	}*/
}

chrome.extension.onConnect.addListener(function(port){
    port.onMessage.addListener(function(a){
        //console.log('get content message ' + a.message);
        if (a.message === 'scan') {
            savepage(a.options, function(res){
                req('bg-scan', false, res);
            });
        } else if (a.message === 'apply') {
            apply(a.options.data, a.tab, function(res){
                req('bg-apply');
				//sendMessage("Current profile applied to current page!");
            });
        }else if (a.message === 'unpackpage') {
            var scripts = getAllScripts();
            var styles = getAllStyles();
            req('unpack', function(a){
                replaceResources(a);
				//callback to popup to show message?
				//sendMessage("Page is now unpacked!");
            }, {
                scripts: scripts,
                styles: styles
            });
            
        }
    });
});

function replaceResources(files){
    $.each(files, function(id, s){
        if (s.file) {
            document.write(s.code);
        } else {
            if (s.type === 'js') {
                console.log('Script : ' + id);
                addjs(s.code, true, id);
            } else {
                console.log('Style : ' + id);
                addcss(s.code, true, id);
            }
        }
    });
}


var mytabId;
function apply(options, tabId, cb){
    mytabId = tabId;
    console.log('scanner.apply css');
    var css = autoUpdate(options.css, false);
    addStyle(css, 'thcss' || options.id, true);
    
    console.log('scanner.apply js');
    var js = autoUpdate(options.js, true);
    addScript(js, 'thjs' || options.id, true);
}

function savepage(options, cb){
    //saveimages(options, cb);
    savecss(options, function(a){
        savejs(options, function(b){
            $.extend(a, b);
            cb(a);
        });
    });
}

function saveimages(options, cb){
    $('img').each(function(i, link){
    
    });
}

function savejs(options, cb){
    var scripts = [], modulos = 0, ended = false;
    
    $('script').each(function(i, el){
        var url = $(el).attr('src');
        var s = {
            url: url
        };
        if (s.url) {
            s.url = absoluteUrl(s.url);
        } else {
            s.code = $(el).text();
        }
        
        if (s.url) {
            ++modulos;
            $.get(s.url, function(data){
                --modulos;
                console.log('url:' + s.url);
                scripts.push(s);
                if (ended && modulos === 0) {
                    cb({
                        location: window.location.href,
                        scripts: scripts
                    });
                }
                
            });
        } else {
            scripts.push(s);
        }
    });
    ended = true;
}

function savecss(options, cb){
    var styles = [], modulos = 0, ended = false;
    
	$('style').each(function(i, el){
        var s = {
			code: $(el).text()
		};
        styles.push(s);
    });
	
    $('link[rel="stylesheet"]').each(function(i, el){
        var url = $(el).attr('href');
        var s = {
            url: url
        };
        if (s.url) {
            s.url = absoluteUrl(s.url);
        } else {
            s.code = $(el).text();
        }
        
        if (s.url) {
            ++modulos;
            $.get(s.url, function(data){
                --modulos;
                console.log('url:' + url);
                styles.push(s);
                var urlimports = checkImport(url, data);
                if (urlimports && urlimports.length > 0) {
                    styles.push(urlimports);
                }
                if (ended && modulos === 0) {
                    cb({
                        location: window.location.href,
                        styles: styles
                    });
                }
            });
        } else {
            styles.push(s);
        }
    });
    ended = true;
}

function checkImport(url, data){
    var urls = [], m;
    while ((m = /@import[^\(]*\(([^)]*)\)/g.exec(data))) {
        console.log('import:' + m[1]);
        
        var uri = parseUri(url);
        var urlbase = uri.protocol + '://' + uri.authority + uri.directory;
        
        var newurl = absoluteUrl(m[1], urlbase);
        console.log('urlbase:' + urlbase);
        console.log('absoluteUrl:' + newurl);
        urls.push(newurl);
    }
    return urls;
}


//remove parameters
function noParameters(url){
    var uri = parseUri(url);
    var res = uri.protocol + '://' + uri.authority + uri.path;
    return res;
}
