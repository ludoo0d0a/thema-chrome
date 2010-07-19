req('profiles', function(profiles){
    var url = window.location.href;
    $.each(profiles, function(id, p){
        if (p && p.url) {
            $.each(p.url, function(i, u){
                var re = new RegExp(encodeRE(u));
                if (re.test(url)) {
                    console.log('Apply profile ' + id + ' / ' + u);
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
autoIntall();

chrome.extension.onConnect.addListener(function(port){
    port.onMessage.addListener(function(a){
        //console.log('get content message ' + a.message);
        if (a.message === 'scan') {
            savepage(a.options, function(res){
                req('bg-scan');
            });
        } else if (a.message === 'apply') {
            apply(a.options.data, a.tab, function(res){
                req('bg-apply');
            });
        } else if (a.message === 'unpack') {
            unpackscripts(a.options.data, a.tab, function(res){
                //req('unpackdone');
            });
        } else if (a.message === 'unpackpage') {
            var s = getAllScripts();
            req('unpack', function(a){
                replaceScripts(a);
                //$().message("Unpack done!");
            }, {
                scripts: s
            });
            
        }
    });
});

function replaceScripts(scripts){
    $.each(scripts, function(id, s){
        if (s.jsfile) {
            document.write(s.code);
        } else {
            addjs(s.code, true, id);
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
			$.extend(a,b);
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
        var s = {
            url: $(el).attr('src')
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
                if (ended && modulos == 0) {
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
    
    $('link[rel="stylesheet"]').each(function(i, el){
		var s = {
            url: $(el).attr('href')
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
				if (ended && modulos == 0) {
					cb({
						location: window.location.href,
						styles: styles
					});
				}
			});
		}else {
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
