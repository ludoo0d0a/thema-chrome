req('dataprofiles', function(profiles){
    var url = window.location.href;
    console.log(url);
    console.log(profiles);
    $.each(profiles, function(id, p){
        if (p && p.url) {
            var re = new RegExp(encodeRE(p.url));
            if (re.test(url)) {
                console.log('Apply profile ' + id + ' / ' + p.url);
                apply(p);
            }
        }
    });
});



chrome.extension.onConnect.addListener(function(port){
    port.onMessage.addListener(function(a){
        console.log('get content message ' + a.message);
        if (a.message === 'scan') {
            savepage(a.options, function(res){
                req('bg-scan');
            });
        } else if (a.message === 'apply') {
            apply(a.options.data, a.tab, function(res){
                req('bg-apply');
            });
        }
    });
});

var mytabId;
function apply(options, tabId, cb){
    mytabId=tabId;
	console.log('scanner.apply css');
    var css = autoUpdate(options.css, false);
    addStyle(css, 'thcss' || options.id, true);
    
    console.log('scanner.apply js');
    var js = autoUpdate(options.js, true);
    addScript(js, 'thjs' || options.id, true);
    
    
}

function savepage(options, cb){
    //saveimages(options, cb);
    savecss(options, cb);
}

function saveimages(options, cb){
    $('img').each(function(i, link){
    
    });
}

function savecss(options, cb){
    var urls = [], modulos = 0, allcss = false;
    
    $('link[rel="stylesheet"]').each(function(i, link){
        var url = $(link).attr('href');
        console.log('original:' + url);
        url = resolveUrl(url);
        console.log('resolved:' + url);
        urls.push(url);
        ++modulos;
        $.get(url, function(data){
            --modulos;
            console.log('url:' + url);
            var urlimports = checkImport(url, data);
            if (urlimports && urlimports.length > 0) {
                urls = urls.concat(urlimports);
            }
            if (allcss && modulos == 0) {
                cb({
                    location: window.location.href,
                    urls: urls
                });
            }
        });
    });
    allcss = true;
}

function resolveUrl(url, urlbase){
    urlbase = urlbase || window.location.href;
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

function checkImport(url, data){
    var urls = [], m;
    while ((m = /@import[^\(]*\(([^)]*)\)/g.exec(data))) {
        console.log('import:' + m[1]);
        
        var uri = parseUri(url);
        var urlbase = uri.protocol + '://' + uri.authority + uri.directory;
        
        var newurl = resolveUrl(m[1], urlbase);
        console.log('urlbase:' + urlbase);
        console.log('resolveUrl:' + newurl);
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
