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

function init(){
    var fullsize = (window.location.hash === '#full');
	$(document.body).toggleClass('full',fullsize);
	loadCombo();
    $(".lbl").hide();
    //$(".lbl").inFieldLabels();
    $('#btn-css').click(getcss);
    $('#btn-apply').click(applyprofile);
    $('#btn-save').click(saveprofile);
    $('#btn-new').click(newprofile);
    $('#btn-del').click(delprofile);
    $('#btn-auto').click(toggleauto);
	//$('#btn-html').click(testhtml);
	$('#btn-toast').click(toastdemo);
    inittab();
    initbespin({
        css: {
            syntax: 'css'
        },
        js: {
            syntax: 'js',
            then: function(){
                setTab('css');
                
                //reopen last codes not saved
                req('get', function(o){
                    setDataProfile(o.value);
                    //second time to override saved values (and activate changed flag)
                    setTimeout(function(){
                        setDataValues(o.value);
                    }, 500);
                }, {
                    name: 'auto'
                });
            }
        }
    });
}

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
    console.log('bespin ' + id);
    bespin.useBespin('tx_' + id, o).then(function(env){
        env.settings.set("fontsize", 10);
        env.settings.set("tabstop", 3);
        env.settings.set("autoindent", true);
        env.settings.set("codecomplete", true);
        env.settings.set("completewithspace", true);
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
    //$(".lbl").show();
    req('profiles', function(data){
        profiles = data || {};
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
        name: $('#selprofile :selected').text(),
        url: $('#tx_url').val(),
        js: (editors.js) ? editors.js.value : '',
        css: (editors.css) ? editors.css.value : ''
    }
}

function setData(data){
    setDataProfile(data);
    setDataValues(data);
}

function setDataProfile(data){
    $('#tx_url').val(data.url || '');
    
return;
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
    if (editors.js) {
        editors.js.value = data.js || '';
    }
    if (editors.css) {
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

function openprofile(id){
    console.log('open profile ' + id);
    req('open', function(data){
        console.log('open profile data=');
        console.log(data);
        data = data || {};
        setData(data);
        //$(".lbl").hide();
    }, {
        id: id,
        data: getData()
    });
}

/**
 * Tab
 */
function inittab(){
    $('#btn-codecss').click(function(){
        setTab('css');
    });
    $('#btn-codejs').click(function(){
        setTab('js');
    });
}

function setTab(id){
    $('#tabs_code .active').removeClass('active');
    $('#btn-code' + id).addClass('active');
    
    $('#code .ctn.hidden').removeClass('hidden');
    setTimeout(function(){
        $('.ctn:not(#ctn_' + id + ')').addClass('hidden');
    }, 600);
    
    //console.log('#ctn_' + oid +' '+show);
}

function getCurrentTab(){
    var id = 'js', el = $('#tabs_code .btn-tab.active');
    if (el.length > 0) {
        id = el[0].id.replace(/^btn-code/, '');
    }
    return id;
}

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



