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
    initbespin({
        'tx_css': {
            syntax: "css"
        },
        'tx_js': {
            syntax: "js"
        }
    });
}

var editor, editorId;
function setbespin(id, config){
    var ed = $('div.bespin'), txt = ed.prev(), oldvalue = editor ? editor.value : '', newvalue = $('#' + id).val();
    var o = config || {};
    o.stealFocus = true;
    bespin.useBespin(id, o).then(function(env){
        env.settings.set("fontsize", 10);
		editor = env.editor;
    });
    editor.value = newvalue;
    
    ed.remove();
    txt.val(oldvalue);
    txt.show();
	editorId=id;
}

function updatevalue(){
	if (editor) {
		$('#' + editorId).val(editor.value);
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
}

function delprofile(){
    var id = $('#selprofile').val();
    var sibling = $('#selprofile :selected').prev() || $('#selprofile :selected').next();
    var name = $('#selprofile :selected').text();
    req('del', function(){
        loadCombo(sibling.val());
        $().message("Profile " + name + " deleted!");
    }, {
        id: id
    });
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

function newprofile(pname){
    var count = $('#selprofile option').length + 1;
    var name = pname || 'My profile ' + count;
    var id = 'p' + count;
    savemyprofile(null, name, {});
}

function savemyprofile(id, name, data){
    var o = {
        id: id,
        data: data
    };
    o.data.name = name;
    if (!o.id) {
        //new
        o.id = 'p' + count;
        req('new', function(status){
            if (status) {
                loadCombo(o.id);
                $().message("Profile " + name + " created!");
            } else {
                $().message("Profile " + name + " creation failed!");
            }
        }, o);
    } else {
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
    console.log('open ask ' + id);
    req('open', function(data){
        //console.log('open response');
        //console.log(data);
        data = data || {};
        setData(data);
        $(".lbl").hide();
    }, {
        id: id,
        data: getData()
    });
}


