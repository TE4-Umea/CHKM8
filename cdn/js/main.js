/**
 * Main script
 * This script logs in the user and connects to socket.io
 */

 
var me;
var on_login = () => {};

var token = localStorage.getItem('token');
window.onload = () => {
    if (token) {
        if (location.pathname == '/') location.href = '/dashboard';
        //Gets user data specified by token.
        axios
            .get('/api/user', {
                params: {
                    token,
                },
            })
            .then(res => {
                var data = res.data;
                if (data.success) {
                    me = data.profile;
                    on_login();
                } else {
                    localStorage.removeItem('token');
                    location.href = '/';
                }
            });
    } else {
        console.warn(`Token not found, please visit ${location.origin}/login`);
    }
};

function logout() {
    localStorage.removeItem('token');
    location.href = '/login';
}

function notice(message, success = true) {
    var notice_box = document.createElement('div');
    notice_box.classList.add('notice');
    notice_box.classList.add(success ? 'success' : 'error');
    var notice_text = document.createElement('span');
    notice_text.innerText = message;
    notice_text.classList.add('notice-text');
    notice_box.appendChild(notice_text);
    var br = document.createElement('br');
    document
        .getElementById('notices')
        .insertBefore(br, document.getElementById('notices').children[0]);
    document
        .getElementById('notices')
        .insertBefore(
            notice_box,
            document.getElementById('notices').children[0]
        );

    setTimeout(() => {
        notice_box.style.top = '0px';
    }, 50);

    setTimeout(() => {
        notice_box.style.opacity = '0';
        setTimeout(() => {
            notice_box.remove();
            br.remove();
        }, 1000);
    }, 2000);
}

function set_cookie(name, value, days) {
    var expires = '';
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
}

function get_cookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function delete_cookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}

function format_time(ms) {
    var hours = Math.floor(ms / 1000 / 60 / 60);
    var minutes = Math.floor(ms / 1000 / 60 - hours * 60);
    return (hours ? hours + 'h ' : '') + minutes + 'm';
}