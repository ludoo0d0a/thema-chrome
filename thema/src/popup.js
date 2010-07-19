/**
 * Main popup
 *
 * @author Ludovic Valente
 * @web pitaso.com
 * @web xeoos.fr
 */
var OPTIONS = {
    editor: 'bespin', //bespin,codemirror,textarea
    config: {
        codemirror: {
            js: {
                parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
                stylesheet: "lib/codemirror/css/jscolors.css",
                path: "lib/codemirror/js/"
            },
            css: {
                parserfile: "parsecss.js",
                stylesheet: "lib/codemirror/css/csscolors.css",
                path: "lib/codemirror/js/"
            }
        }
    }
};


var default_profiles = {
    'p1': {
        name: 'Hello google',
        url: 'google.com',
        js: "console.log('Hello world');",
        css: '/* No CSS */ '
    },
    'p2': {
        name: 'Alert google',
        url: 'google.com',
        js: "alert('Hello world');",
        css: 'body{background-color:red !important;}'
    }
};

$(function(){
    var fullsize = (window.location.hash === '#full');
    $(document.body).toggleClass('full', fullsize);
    inittab();
    req('get', function(a){
        console.log('get editor:' + a.value);
        console.log(a);
        OPTIONS.editor = a.value || OPTIONS.editor;
        $('#teditor').val(OPTIONS.editor);
        initeditors({
            css: {
                syntax: 'css'
            },
            js: {
                syntax: 'js',
                then: function(){
                    loadCombo();
                }
            }
        });
    }, {
        name: 'editor'
    });
    
   
	$('#btn-scan').click(scanPage);
    $('#btn-apply').click(applyprofile);
    $('#btn-save').click(saveprofile);
    $('#btn-new').click(newprofile);
    $('#btn-del').click(delprofile);
    $('#btn-auto').click(toggleauto);
    //$('#btn-load').click(loadCombo);
    //$('#btn-html').click(testhtml);
    //$('#btn-toast').click(toastdemo);
    $('#btn-unpack').click(unpack);
    $('#teditor').bind('change', function(){
        req('set', null, {
            name: 'editor',
            value: $('#teditor').val()
        });
    })
    
});


function initeditors(configs){
    if (OPTIONS.editor === 'bespin') {
        window.onBespinLoad = function(){
            $.each(configs, function(id, config){
                setbespin(id, config);
            });
        }
    } else if (OPTIONS.editor === 'codemirror') {
        $.each(configs, function(id, config){
            setcodemirror(id, config);
        });
    } else {
        $.each(configs, function(id, config){
            settextarea(id, config);
        });
    }
}

var editors = {}, cmeditors = {};
function setbespin(id, config, title){
    var o = config || {};
    o.stealFocus = true;
    o.autoindent = true;
    o.codecomplete = true;
    o.completewithspace = true;
    console.log('bespin ' + id);
    bespin.useBespin('tx_' + id, o).then(function(env){
        env.settings.set("fontsize", 11);
        env.settings.set("tabstop", 3);
        editors[id] = env.editor;
        editors[id].textChanged.add(function(oldRange, newRange, newVal){
            if (newVal) {
                ontextchanged(id);
            }
        });
        if (config.then) {
            config.then();
        }
    });
}

function settextarea(id, config, title){
    editors[id] = $("<textarea class='ted'></textarea>");
    editors[id].bind('keyup', function(){
        ontextchanged(id);
    })
    editors[id].appendTo($('#tx_' + id));
    if (config.then) {
        config.then();
    }
}

function setcodemirror(id, config, title){
    settextarea(id, config, title);
    var tid = 'tx_' + id;
    var textarea = document.getElementById(tid);
    
    var config = OPTIONS.config.codemirror[id] || {};
    $.extend(config, {
        height: "350px",
        content: textarea.value,
        autoMatchParens: true
    });
    
    cmeditors[id] = CodeMirror.fromTextArea(tid, config);
}

function ontextchanged(){
    if (!editors[id]._textChanged) {
        $('#changed').show();
        editors[id]._textChanged = true;
    }
    if (!editors[id]._autosave) {
        var data = getData();
        data.tab = getCurrentTab();
        req('set', {
            name: 'auto',
            value: data
        });
    }
}

function toggleauto(e){
    var el = $(e.target);
    el.toggleClass('active');
    var status = el.hasClass('active');
    editors.css._autosave = status;
    editors.js._autosave = status;
}

function formatComboData(profiles, selected){
    var r = [];
    $.each(profiles, function(i, p){
        r.push({
            value: i,
            text: p.name,
            selected: (selected && selected === i)
        });
    });
    return r;
}

function loadCombo(selected){
    setData({});
    req('profiles', function(data){
        if (data) {
            profiles = data;
        } else {
            profiles = default_profiles;
            selected = 'p1';
        }
        //profiles = data || default_profiles;
        var p = formatComboData(profiles, selected);
        //clear previous sexy combo
        $("#ctn-profile").html('');
        cbo = $.sexyCombo.create({
            name: "selprofile",
            id: "selprofile",
            container: "#ctn-profile",
            data: p,
            triggerSelected: true,
            autoFill: true,
            changeCallback: function(){
                //change profile
                openprofile(this.hidden.val(), profiles);
            }
        });
        if (selected) {
            console.log('open new selected profile ' + selected);
            openprofile(selected, profiles);
        }
    });
}

function scanPage(){
	var options = {
        images: $('#chk_save_images').val(),
        css: $('#chk_save_css').val(),
		unpack:$('#chk_unpack_js').val()
    };
    inject('scan', function(o){
        $('#output').html('');
		function listItems(o, id,name, el){
			$('<h2>'+name+'</h2>').appendTo(el);
			var html='<li>' + o.location + '</li>', ul = $('<ul></ul>').appendTo(el);
			$.each(o[id], function(i, s){
				html+='<li><a href="' + s.url + '">' +  s.url + '</a></li>';
				html+='<li>' + s.code + '</li>';
			});
			ul.append(html);
		}
		listItems(o, 'styles', 'CSS stylesheets', '#output');
		listItems(o, 'scripts', 'Javascript files', '#output');
    }, options);
}

function getData(){
    //updatevalue();
    var o = {
        name: $('#tx_name').val(),
        url: $('#tx_url').val().split('\n')
    }
    
    if (OPTIONS.editor === 'bespin') {
        o.js = editors.js.value || '';
        o.css = editors.css.value || '';
    } else if (OPTIONS.editor === 'codemirror') {
        o.js = cmeditors.js.getCode() || '';
        o.css = cmeditors.css.getCode() || '';
    } else {
        o.js = editors.js.val() || '';
        o.css = editors.css.val() || '';
    }
    
    return o;
}

function setData(data){
    data = data || {};
    setDataProfile(data);
    setDataValues(data);
}

function setDataProfile(data){
    $('#tx_name').val(data.name || '');
    var url = data.url || '';
    if (isArray(data.url)) {
        url = data.url.join('\n');
    }
    $('#tx_url').val(url);
    
    var s = data.tab || getCurrentTab();
    if (data.js && !data.css && s == 'css') {
        //set focus on js
        setTab('js');
    } else if (data.css && !data.js && s == 'js') {
        //set focus on css
        setTab('css');
    }
}

function setDataValues(data){
    if (OPTIONS.editor === 'bespin') {
        if (editors.js) {
            editors.js.value = data.js || '';
        }
        if (editors.css) {
            editors.css.value = data.css || '';
        }
    } else if (OPTIONS.editor === 'codemirror') {
        if (cmeditors.js) {
            cmeditors.js.setCode(data.js || '');
        }
        if (cmeditors.css) {
            cmeditors.css.setCode(data.css || '');
        }
    } else {
        if (editors.js) {
            editors.js.val(data.js || '');
        }
        if (editors.css) {
            editors.css.val(data.css || '');
        }
    }
}

function delprofile(){
    var name = $('#selprofile :selected').text();
    if (confirm("Are you sure to delete Profile " + name + "?")) {
        var id = $('#selprofile').val();
        var sibling = $('#selprofile :selected').prev() || $('#selprofile :selected').next();
        req('del', function(){
            //loadCombo(sibling.val());
            loadCombo();
            $().message("Profile " + name + " deleted!");
        }, {
            id: id
        });
    }
}

function logme(){
    var e = cbo;
    console.log('getCurrentTextValue:' + e.getCurrentTextValue());
    console.log('getTextValue:' + e.getTextValue());
    console.log('getHiddenValue:' + e.getHiddenValue());
    console.log('getCurrentHiddenValue:' + e.getCurrentHiddenValue());
}

function saveprofile(){
    var id = cbo.getHiddenValue();
    savemyprofile(id, getData());
}

function newprofile(){
    savemyprofile(null, {});
}

function savemyprofile(id, data){
    if (!id) {
        req('new', function(p){
            if (p) {
                loadCombo(p.id);
                $().message("Profile " + p.data.name + " created!");
            } else {
                $().message("Profile creation failed!");
            }
        });
    } else {
        var o = {
            id: id,
            data: data
        };
        //save
        req('save', function(){
            $().message("Profile " + name + " saved!");
            $('#changed').hide();
            loadCombo(id);
        }, o);
    }
}

function applyprofile(){
    inject('apply', function(){
        $().message("Injection done!");
    }, {
        id: $('#selprofile').val(),
        data: getData()
    });
}

function unpack(){
    inject('unpackpage', function(){
        $().message("Unpack done!");
    });
}

function openprofile(id, pdata){
    console.log('open profile ' + id);
    $('#changed').hide();
    if (pdata) {
        setData(pdata[id]);
    } else {
        req('open', function(data){
            console.log('open profile data=');
            console.log(data);
            data = data || {};
            setData(data);
        }, {
            id: id
        });
    }
}


/**
 * Tab
 */
var tabs;
function inittab(){
    $.tools.tabs.addEffect("def", function(tabIndex, done){
        this.getPanes().hide().eq(tabIndex).show();
        showEditor(tabIndex);
    });
    
    tabs = $("ul.tabs").tabs("div.panes > div", {
        effect: 'def'
    });
    
}

function getCurrentTab(){
    if (tabs && tabs.getCurrentTab) {
        return tabs.getCurrentTab().attr('id').replace(/^tab_/, '');
    } else {
        var li = $("ul.tabs li a.current").parents()[0];
        return $(li).attr('id').replace(/^tab_/, '');
    }
    
}

var tabsIndex = {
    css: 1,
    js: 2,
    settings: 3
};
function setTab(id){
    if (tabsIndex[id]) {
        //tabs.click(tabsIndex[id]);
    }
}

function showEditor(index){
    $('.ctn_editor').css('left', -9999);
    $('.editor_' + index).css('left', 0);
}

/* 

 function toastdemo(){

 setTimeout(function(){

 req('toast', {

 title: 'Demo toast',

 text: 'This a toast'

 });

 }, 2000);

 

 setTimeout(function(){

 req('toast', {

 html: 'http://fr.grepolis.com'

 });

 }, 5000);

 }

 */

