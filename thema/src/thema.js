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
    var css = $('#' + id);
    if (css && css.length > 0) {
        setval(css, styles, astext);
    } else {
        if (astext) {
            css = $('<style type="text/css"></style>');
        } else {
            css = $('<link type="text/css" rel="stylesheet"></link>');
        }
        if (id) {
            css.attr('id', id);
        }
        setval(css, styles, astext);
        css.appendTo($('head'));
    }
}

function addScript(scripts, lid, astext){
    var id = PREFIX + lid;
    var script = $('#' + id);
    if (script && script.length > 0) {
        script.remove();
    }
    
    script = $('<script type="text/javascript"></script>');
    if (id) {
        script.attr('id', id);
    }
    setval(script, scripts, astext);
    script.appendTo($('head'));
    
}
