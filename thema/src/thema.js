/*chrome.extension.onConnect.addListener(function(port){
 port.onMessage.addListener(function(msg){
 switch (msg) {
 case 'abanti':
 abanti();
 chrome.extension.sendRequest({
 msg: 'view-scripts',
 inline: inlineScripts,
 external: externalScripts
 });
 break;
 }
 });
 });
 */


/**
 * Samples of monitoring (ala Aardvardk)
 */
/*
$jQ('div').hover(function(){
$jQ(this).css('border', '1px solid red');
},function(){
$jQ(this).css('border', '');
});
*/
function addJquery(){
	var url = 'http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js';
	addScript(url, 'jq');
	
	var js= "var $jQ=jQuery;jQuery.noConflict();";
	addScript(js, 'jq0', true);
}

function abanti(){
    //128x1024 ok 65%
    //1024x768 ok 55%
    var pos = $('.timesheetCalendar td.today:first').prevAll().length;
    var styles = [{
        url: 'abanti.sogeti.be/abanti/',
        css: '.divScroll{overflow:auto;width:55%;}' +
        '#divTimesheet{width:auto;}' +
        '.timesheetEntry{padding:0px;}' +
        '.timesheetCalendar tr td.timesheetEntry:nth-child(' +
        (pos + 1) +
        '){background: #C7EEC1;}' +
        '.header_container, .inner h3{display:none;}' +
        '.inner{padding:0px}' +
        '#primaryContent{padding:0px}' +
        '.outer{margin:0px}' +
        '.header_menu{top:0px;}'
    }];
    
    var url = window.location.href;
    $.each(styles, function(i, o){
        var r = new RegExp(o.url, 'i');
        if (r.test(url)) {
            addStyle(o.css);
        }
    });
    
    $('<a href="#">Unlock</a>').insertAfter('#divSave').bind('click', function(){
        $('input:disabled').removeAttr('disabled');
    });
    
};

function setval(el, text, astext){
    if (astext) {
        el.text(text);
    } else {
        el.attr('href', text);
    }
}

var PREFIX = '__tHema_';
function addStyle(styles, lid, astext){
    var id = PREFIX + lid;
    var el = $('#' + id);
    if (el && el.length > 0) {
        setval(el, styles, astext);
    } else {
        if (astext) {
            el = $('<style type="text/css"></style>');
        } else {
            el = $('<link type="text/css" rel="stylesheet"></link>');
        }
        if (id) {
            el.attr('id', id);
        }
       
		if (astext) {
        el.text(styles);
    } else {
        el.attr('href', styles);
    }
		
        el.appendTo($('head'));
    }
}

function addScript(scripts, lid, astext){
    var id = PREFIX + lid;
    var el = $('#' + id);
    if (el && el.length > 0) {
        el.remove();
    }
    
    el = $('<script type="text/javascript"></script>');
    if (id) {
        el.attr('id', id);
    }
	if (astext) {
        el.text(scripts);
    } else {
        el.attr('src', scripts);
    }
	
    el.appendTo($('head'));
    
}
