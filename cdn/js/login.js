var login_mode = false;

function check_usersname(el) {
    el.value = el.value.replace(/[^a-z0-9_]+|\s+/gim, '');
    if (el.value.length < 3) {
        update_login_page(true, true);
        return;
    }

    axios
        .get('/api/user/taken', {
            params: {
                username: el.value,
            },
        })
        .then(res => {
            update_login_page(res.data.taken);
        });
    /* socket.emit("username_taken", el.value) */
}

/* socket.on("username_taken", taken => {
    update_login_page(taken)
}) */

function update_login_page(username_taken, disabled = false) {
    login_mode = username_taken;
    document.getElementById('name').style.display = username_taken
        ? 'none'
        : 'block';
    var button = document.getElementById('login-button');
    button.disabled = disabled;
    button.title = disabled
        ? 'Username must be at least 3 characters long'
        : username_taken
        ? 'Log in'
        : 'Create account';
    button.innerText = disabled
        ? 'sign up / log in'
        : username_taken
        ? 'log in'
        : 'Sign up';
}

function error(msg) {
    var error_box = document.getElementById('error-message');
    error_box.innerText = msg;
    error_box.style.display = 'block';
}

function success(token) {
    localStorage.setItem('token', token);
    location.href = '/dashboard';
}

function login() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var name = document.getElementById('name').value;
    if (login_mode) {
        axios
            .post('/api/user/auth', {
                username,
                password,
            })
            .then(res => {
                var data = res.data;
                if (data.success) {
                    success(data.token);
                } else {
                    error(data.text);
                }
            });
    } else {
        axios
            .post('/api/user', {
                username,
                password,
                name,
            })
            .then(res => {
                var data = res.data;
                if (data.success) {
                    success(data.token);
                } else {
                    errror(data.text);
                }
            });
    }
}

document.addEventListener('keypress', e => {
    if (e.key == 'Enter') login();
});
