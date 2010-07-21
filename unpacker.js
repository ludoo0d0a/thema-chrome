//from bg
function unpackpage(a, cb){
	mergeResources(a.scripts, a.styles, cb);
}

//deprecated
/*function unpackscripts(options, cb){
	var scripts = getAllScripts();
	var styles = getAllStyles();
	mergeResources(scripts, styles, cb);
}*/
	
function mergeResources(scripts, styles, cb){
	var files = {};
	$.each(scripts, function(i,s){
		files[i]=s;
		files[i].type='js';
	});
	$.each(styles, function(i,s){
		files[i]=s;
		files[i].type='css';
	});
    processResources(files, cb);
}

function processResources(files, cb){
    var res = {}, count = getSize(files);
    //var clones = $.extend({},a.scripts);
    console.log('Start at ' + count);
    function countdown(id){
        count--;
        console.log('countdown for ' + id + ' = ' + count);
        //delete clones[id];
        //console.log(clones);
        if (count <= 0) {
            if (cb) {
                cb(res);
            }
        }
    }
	if (count<=0){
		countdown('');
	}
    
	//jsfile for js page
    $.each(files, function(id, s){
        var urlPage = getUrlBase(s.url);
		if (s.url) {
            xhr({
                url: s.url
            }, function(xhr){
                var txt = xhr.responseText;
                if (txt) {
                    res[id] = {
                        url: s.url,
						type:s.type
                    };
					if (s.type==='js'){
						 res[id].code = unpackscript(txt, s.url);
						 console.log('Script ' + id + ' unpacked : ' + s.url);
					}else{
						res[id].code = resolveUrlCss(txt, s.url, urlPage);
						console.log('Style ' + id + ' : ' + s.url);
					}
					
					if (s.file) {
                        res[id].jsfile = s.jsfile;
                    }
                }
                countdown(id);
            });
        } else {
            res[id] = {
				type:s.type
			};
			if (s.type === 'js') {
				res[id].code = unpackscript(s.text);
				console.log('Inline script ' + id + ' unpacked ');
			}else{
				res[id].code = s.text;
				console.log('Inline stylesheet ' + id);
			}
            if (s.jsfile) {
                res[id].jsfile = s.jsfile;
            }
            countdown(id);
        }
    });
}

function resolveUrlCss(code, url, urlPage){
	var c = code.replace(/url\(([^\)]*)/, function(text,url,pos){
		console.log('replaced '+url);
		url = url.replace(/^["']/,'').replace(/["']$/,'')
		var u = absoluteUrl(url,urlPage);
		console.log('with  '+u);
		return u;
	});
	c='/* From '+url + '*/\n'+unpackcss(c);
	return c;
}

function unpackcss(code){
	var c = code;
	//compact
	code = code.replace(/[\s\t]+/g, ' ');
	//expand
	code = code.replace(/}/g, '}\n').replace(/,/g, ',\n').replace(/\n+/g, '\n');
	return c;
}

function unpackscript(code, url){
    var unpacked = js_beautify(unpacker_filter(code), {
        indent_size: 4,
        indent_char: ' ',
        preserve_newlines: true,
        braces_on_own_line: true,
        space_after_anon_function: true
    });
    if (url) {
        unpacked = '/* Unpacked from ' + url + '*/\n' + unpacked;
    }
    return unpacked;
    //addjs(unpacked, true, id, cb);
}


function trim_leading_comments(str){
    // very basic. doesn't support /* ... */
    str = str.replace(/^(\s*\/\/[^\n]*\n)+/, '');
    str = str.replace(/^\s+/, '');
    return str;
}

function unpacker_filter(source){
    var stripped_source = trim_leading_comments(source);
    var unpacked = '';
    
    if (P_A_C_K_E_R.detect(stripped_source)) {
        unpacked = P_A_C_K_E_R.unpack(stripped_source);
        if (unpacked !== stripped_source) {
            return unpacker_filter(unpacked);
        }
    }
    
    if (EscapedBookmarklet.detect(source)) {
        unpacked = EscapedBookmarklet.unpack(source);
        if (unpacked !== stripped_source) {
            return unpacker_filter(unpacked);
        }
    }
    
    if (JavascriptObfuscator.detect(stripped_source)) {
        unpacked = JavascriptObfuscator.unpack(stripped_source);
        if (unpacked !== stripped_source) {
            return unpacker_filter(unpacked);
        }
    }
    return source;
}

