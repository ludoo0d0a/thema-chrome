var isChrome = (typeof chrome !== 'undefined'), cbo, profiles = [];

var emptyFn = function(){};
function req(message, cb, data){
    if (isChrome && chrome.extension) {
        if (typeof cb==='object' && typeof data ==='undefined'){
			data=cb;
			cb=false;
		}
		var o = data || {};
        o.message = message;
        console.log('send req '+message);
		console.log(o);
		chrome.extension.sendRequest(o, cb||emptyFn);
    }else{
		cb(false);
	}
}

function _get(name, cb){
	req('get', cb, { name: name});
}
function _set(name, value, cb){
	req('set', cb, { name: name, value:value});
}


function requesttext(url, cb){
	req('xhr', function(xhr){
		if (xhr.status == 200) {
			cb(xhr.responseText);
		}
	}, {url:url});
}

/*
function inject(message, cb, data){
    chrome.tabs.getSelected(null, function(tab){
        var bkg = chrome.extension.getBackgroundPage();
        chrome.tabs.executeScript(tab.id, 'scanner.js', function(){
            bkg.storage.getItem('scanner-values');
        });
    });
}
*/
function inject(msg, cb, options){
	chrome.tabs.getSelected(null, function(tab){
        var port = chrome.tabs.connect(tab.id);
		port.postMessage({
            message: msg,
			tab:tab.tabId,
            options: options
        });
		port.onMessage.addListener(function(a){
			console.log('port.onMessage.addListener');
			console.log(a);
			cb(a);
		});
    });
}

function executeScript(file){
    chrome.tabs.getSelected(null, function(tab){
        if (!isUrl(tab.url)) 
            return;
        var js_file = {};
        js_file.allFrames = true;
        js_file.file = file;
        chrome.tabs.executeScript(tab.id, js_file);
    });
}

function getUrl(cb){
    chrome.tabs.getSelected(null, function(tab){
        cb(tab.url);
    });
}

function isUrl(url){
    return (new String(url)).match(/^https?:\/\//i) ? true : false;
}

//http://snipplr.com/view/9649/escape-regular-expression-characters-in-string/
//http://simonwillison.net/2006/Jan/20/escape/
var re_encodeRE = new RegExp("[.+?|()\\[\\]{}\\\\]", "g"); // .+?|()[]{}\
function encodeRE(s){
    return s.replace(re_encodeRE, "\\$&").replace(/\s/g, '\\s').replace(/\*/g, '.*');
}
