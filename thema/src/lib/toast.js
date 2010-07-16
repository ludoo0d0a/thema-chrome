function toast(a, cb){
    if (a && a.html) {
        toastHtml(a.html);
    } else if (a && a.text) {
        toastText(a.icon || 'images/icon48.png', a.title || 'Message', a.text);
    }
}

function toastText(icon, title, text){
    if (webkitNotifications) {
        var notification = webkitNotifications.createNotification(icon, title, text);
        notification.show();
    }
}

function toastHtml(page){
    if (webkitNotifications) {
        var notification = webkitNotifications.createHTMLNotification(page);
        notification.show();
    }
}
/*
if (webkitNotifications) {
    var time = /(..)(:..)/(Date());
    var hour = time[1] % 12 || 12; 
    var period = time[1] < 12 ? 'a.m.' : 'p.m.';
    var notification = webkitNotifications.createNotification('48.png', 
	 	hour + time[2] + ' ' + period, 
	 	'Time to make the toast.'
	);
    notification.show();
}
*/
