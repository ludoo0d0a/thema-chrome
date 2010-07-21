function printSource(o){
    $('#output').html('');
    listItems(o, 'styles', 'CSS stylesheets', '#output');
    listItems(o, 'scripts', 'Javascript files', '#output');
}

function listItems(o, id, name, el){
    $('<h2>' + name + '</h2>').appendTo(el);
    var html = '<li>' + o.location + '</li>', ul = $('<ul></ul>').appendTo(el);
    $.each(o[id], function(i, s){
        html += '<li><a href="' + s.url + '">' + s.url + '</a></li>';
        html += '<li>' + s.code + '</li>';
    });
    ul.append(html);
}
