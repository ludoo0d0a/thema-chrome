/**
 * Main popup
 *
 * @author Ludovic Valente
 * @web pitaso.com
 * @web xeoos.fr
 */
var samples = {
    profiles: {
        1: 'p1',
        2: 'p2'
    }
};

//div{border:5px solid red;}
$(function(){
    var fullsize = (window.location.hash === '#full');
    $(document.body).toggleClass('full', fullsize);
    inittab();
    loadCombo();
    initbespin({
        css: {
            syntax: 'css'
        },
        js: {
            syntax: 'js',
            then: function(){
                //reopen last codes not saved
                req('get', function(o){
                    setDataProfile(o.value);
                    //second time to override saved values (and activate changed flag)
                    setTimeout(function(){
                        setDataValues(o.value);
						$('#changed').hide();
                    }, 500);
                }, {
                    name: 'auto'
                });
            }
        }
    });
    
    $('#btn-css').click(getcss);
    $('#btn-apply').click(applyprofile);
    $('#btn-save').click(saveprofile);
    $('#btn-new').click(newprofile);
    $('#btn-del').click(delprofile);
    $('#btn-auto').click(toggleauto);
    //$('#btn-html').click(testhtml);
    //$('#btn-toast').click(toastdemo);
    $('#btn-unpack').click(unpack);
});


function initbespin(configs){
    window.onBespinLoad = function(){
        $.each(configs, function(id, config){
            setbespin(id, config);
        });
    }
}

var editors = {};
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
        });
        $('#changed').hide();
        if (config.then) {
            config.then();
        }
    });
    
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
            text: p,
            selected: (selected && selected === i)
        });
    });
    return r;
}

function loadCombo(selected){
    setData({});
    req('profiles', function(data){
        profiles = data || samples.profiles;
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
                openprofile(this.hidden.val());
            }
        });
        if (selected) {
            console.log('open new selected profile ' + selected);
            openprofile(selected);
        }
    });
}

function getcss(){
    var options = {
        images: $('#chk_save_images').val(),
        css: $('#chk_save_css').val()
    };
    inject('scan', function(o){
        /*$('#output').html('');
         var ul = $('<ul></ul>').appendTo('#output');
         ul.append('<li>' + o.location + '</li>');
         $.each(o.urls, function(i, url){
         ul.append('<li><a href="' + url + '">' + url + '</a></li>');
         });*/
    }, options);
}

function getData(){
    //updatevalue();
    return {
        name: $('#tx_name').val(),
        url: $('#tx_url').val().split('\n'),
        js: (editors.js) ? editors.js.value : '',
        css: (editors.css) ? editors.css.value : ''
    }
}

function setData(data){
    setDataProfile(data);
    setDataValues(data);
}

function setDataProfile(data){
    if (data) {
        $('#tx_name').val(data.name);
        var url = data.url;
        if (isArray(data.url)) {
            url = data.url.join('\n');
        }
        $('#tx_url').val(url);
    }
    var s = data.tab || getCurrentTab();
    if (!data.css && s == 'css') {
        //set focus on js
        setTab('js');
    } else if (!data.js && s == 'js') {
        //set focus on css
        setTab('css');
    }
    
}

function setDataValues(data){
    if (editors.js && data.js) {
        editors.js.value = data.js || '';
    }
    if (editors.css && data.css) {
        editors.css.value = data.css || '';
    }
}

function delprofile(){
    var name = $('#selprofile :selected').text();
    if (confirm("Are you sure to delete Profile " + name + "?")) {
        var id = $('#selprofile').val();
        var sibling = $('#selprofile :selected').prev() || $('#selprofile :selected').next();
        req('del', function(){
            loadCombo(sibling.val());
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
    var id = cbo.getHiddenValue(), name = cbo.getCurrentTextValue();
    savemyprofile(id, name, getData());
}

function newprofile(){
    savemyprofile(null, null, {});
}

function savemyprofile(id, name, data){
    if (!id) {
        req('new', function(p){
            if (p) {
                loadCombo(p.id);
                $().message("Profile " + p.data.name + " created!");
            } else {
                $().message("Profile creation failed!");
            }
        }, {});
    } else {
        var o = {
            id: id,
            data: data
        };
        o.data.name = name;
        //save
        req('save', function(){
            $().message("Profile " + name + " saved!");
            $('#changed').hide();
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
    inject('unpack', function(){
        $().message("Unpack done!");
    }, { //no option for the moment
});
}

function openprofile(id){
    console.log('open profile ' + id);
    req('open', function(data){
        console.log('open profile data=');
        console.log(data);
        data = data || {};
        setData(data);
    }, {
        id: id,
        data: getData()
    });
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
        return false;
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

