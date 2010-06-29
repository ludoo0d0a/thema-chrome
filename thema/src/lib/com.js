var isChrome = (typeof chrome !== 'undefined'), cbo, profiles = [];

function req(message, cb, data){
    if (isChrome && chrome.extension) {
        var o = data || {};
        o.message = message;
        chrome.extension.sendRequest(o, cb);
    }     
}

/*
 function inject(message, cb, data){
 chrome.tabs.getSelected(null, function(tab){
 var bkg = chrome.extension.getBackgroundPage();
 chrome.tabs.executeScript(tab.id, 'scanner.js', funtion(){
 bkg.storage.getItem('scanner-values');
 });
 });
 }*/
function inject(msg, cb, options){
    chrome.tabs.getSelected(null, function(tab){
        if (!isUrl(tab.url)) 
            return;
        chrome.tabs.connect(tab.id).postMessage({
            message: msg,
            options: options
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
var re_encodeRE = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"); // .*+?|()[]{}\
function encodeRE(s){
    return s.replace(re_encodeRE, "\\$&").replace(' ', '\\W');
}
