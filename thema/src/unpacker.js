var iu = 20;
function unpackscripts(options, tab, cb){
    var scripts = $('script');
	var count= scripts.length;
	function countdown(){
		count--;
		if (count<=0){
			if (cb) {
				cb();
			}
		}
	}
	$('script').each(function(i, s){
        s = $(s);
        var url = s.attr('src');
        var id = s.attr('id');
        if (!id) {
			id = 'tHs_'+(++iu);
			s.attr('id', id);
        }
        if (url) {
			xhr(url, function(txt){
                if (txt) {
					unpackscript(txt, id, countdown);
					console.log('Script '+id+' unpacked : '+url);
				}
            });
        } else {
			unpackscript(s.text(), id, countdown);
			console.log('Script '+id+' unpacked ');
        }
    });
}

function unpackscript(code, id, cb){
    var unpacked = js_beautify(unpacker_filter(code), {
        indent_size: 4,
        indent_char: ' ',
        preserve_newlines: true,
        braces_on_own_line: true,
        space_after_anon_function: true
    });
	addjs(unpacked, true, id, cb);
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

