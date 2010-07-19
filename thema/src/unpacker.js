//from bg
function unpackpage(a, cb){
    processScripts(a, cb);
}
function unpackscripts(options, cb){
    var scripts = getAllScripts();
    processScripts({
        scripts: scripts,
        url: ''
    }, cb);
}

function processScripts(a, cb){
    var res = {}, count = getSize(a.scripts);
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
    
    $.each(a.scripts, function(id, s){
        if (s.url) {
            xhr({
                url: s.url
            }, function(xhr){
                var txt = xhr.responseText;
                if (txt) {
                    res[id] = {
                        url: s.url,
                        code: unpackscript(txt, s.url)
                    };
                    if (s.jsfile) {
                        res[id].jsfile = s.jsfile;
                    }
                    console.log('Script ' + id + ' unpacked : ' + s.url);
                }
                countdown(id);
            });
        } else {
            res[id] = {
                code: unpackscript(s.text)
            };
            if (s.jsfile) {
                res[id].jsfile = s.jsfile;
            }
            console.log('Script ' + id + ' unpacked ');
            countdown(id);
        }
        
    });
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

