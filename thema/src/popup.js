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
    loadCombo();
    $(".lbl").inFieldLabels();
    $('#btn-css').click(getcss);
    $('#btn-apply').click(applyprofile);
    $('#btn-save').click(saveprofile);
    $('#btn-new').click(newprofile);
    $('#btn-del').click(delprofile);
    $('#btn-auto').click(toggleauto);
    inittab();
}

var editor, editorId;
function setbespin(id, config, title){
    var ed = $('div.bespin'), txt = $('#editor'), oldvalue = editor ? editor.value : '';
	//var newvalue = $('#' + id).val();
	var newvalue = $('#tx_' + config.syntax).val();
    var o = config || {};
    o.stealFocus = true;
    bespin.useBespin(id, o).then(function(env){
        env.settings.set("fontsize", 10);
        editor = env.editor;
        if (!editor._textChanged) {
            editor.textChanged.add(function(oldRange, newRange, newVal){
                if (newVal) {
                    $('#changed').show();
                }
            });
            editor._textChanged = true;
        }
        editor.value = newvalue;
		$('#changed').hide();
    });
    
    ed.remove();
    txt.val(oldvalue);
    if (title) {
        txt.attr('title', title);
    }
    //txt.show();
    editorId = config.syntax;
}

function toggleeditor(syntax){
    setbespin('editor', {
        syntax: syntax,
        height: 600
    }, syntax);
}

function updatevalue(){
    if (editor) {
        $('#tx_' + editorId).val(editor.value);
    }
}

function updateeditor(){
    if (editor) {
        editor.value = $('#tx_' + editorId).val();
        $('#changed').hide();
    }
}

function initbespin(configs){
    $.each(configs, function(id, config){
        document.getElementById(id).addEventListener('focus', function(){
            setbespin(id, config);
        }, false);
    });
}

function toggleauto(e){
    var el = $(e.target);
    el.toggleClass('active');
    var evt = 'keyup'; //change
    if (el.hasClass('active')) {
        $('#tx_css').bind(evt, applyprofile);
        $('#tx_js').bind(evt, applyprofile);
    } else {
        //remove event listener
        $('#tx_css').unbind(evt, applyprofile);
        $('#tx_js').unbind(evt, applyprofile);
    }
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
    $(".lbl").show();
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
    return {
        name: $('#selprofile :selected').text(),
        url: $('#tx_url').val(),
        js: $('#tx_js').val(),
        css: $('#tx_css').val()
    };
}

function setData(data){
    $('#tx_url').val(data.url || '');
    $('#tx_js').val(data.js || '');
    $('#tx_css').val(data.css || '');
    updateeditor();
    
    /*
    
     
    
     if (!data.css && editorId=='css'){
    
     
    
     //set focus on js
    
     
    
     setTab(true);
    
     
    
     }else if (!data.js && editorId=='js'){
    
     
    
     //set focus on css
    
     
    
     setTab(false);
    
     
    
     }*/
    
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
        }, o);
    }
}

function applyprofile(){
    inject('apply', function(){
        $().message("Injection done!");
    }, {
        id: $('#selprofile').val(),
        data: getData()
    })
}

function openprofile(id){
    console.log('open profile ' + id);
    req('open', function(data){
        console.log('open profile data=');
        console.log(data);
        data = data || {};
        setData(data);
        $(".lbl").hide();
    }, {
        id: id,
        data: getData()
    });
}

/**
 * Tab
 */
function inittab(){
    window.onBespinLoad = function(){
        setTab(true);
    }
    $('#btn-codecss').click(function(){
        setTab(false);
    });
    $('#btn-codejs').click(function(){
        setTab(true);
    });
}

function setTab(js){
    togglebtn('js', js);
    togglebtn('css', !js);
}

function togglebtn(id, show){
    if (show) {
        //$('#code' + id).show();
        $('#btn-code' + id).addClass('active');
        toggleeditor(id);
    } else {
        //$('#code' + id).hide();
        $('#btn-code' + id).removeClass('active');
    }
}
