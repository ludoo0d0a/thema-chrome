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
