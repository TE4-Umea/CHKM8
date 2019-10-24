if (!token) location.href = '/login';
var sign_token = document.getElementById('slack-sign-token').innerText;
if (sign_token) {
    //Links a Authenticated user with a slack user.
    axios
        .patch('/api/user/slack', {
            token,
            sign_token,
        })
        .then(res => {
            var data = res.data;
            if (data.success) {
                location.href = data.redir;
            } else {
                alert(data.text);
            }
        });
}

const dark = document.getElementById('dark') ? true : false;

window.onresize = () => {
    total_width = 0;
    history_progress = undefined;
    render_history();
};

function resize_canvas(canvas) {
    // look up the size the canvas is being displayed
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // If it's resolution does not match change it
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }
}

var is_expanded = false;
function expand_time_break_down() {
    is_expanded = !is_expanded;
    var summary = document.getElementById('week-summary');
    if (is_expanded) {
        summary.style.height = 'calc(100vh - 530px)';
    } else {
        summary.style.height = '30px';
    }
}

function toggle_darkmode(enabled = undefined) {
    var dark = get_cookie('dark');
    dark = enabled !== undefined ? enabled : !dark;
    set_cookie('dark', dark, 365 * 100); // Expired in 100 years. (Cookies need to expire at some point.)
    location.reload();
}

var days;
var work = 0;

function format_days() {
    work = calcualte_time(checks_data);
    resize_canvas(document.getElementById('history'));
    if (checks_data.length == 0) {
        render_history();
        return;
    }

    for (check of checks_data) {
        check.time = new Date(check.date).getTime();
    }

    // Days to export for render at most 5 days
    days = [];
    window.days_indexes = [];
    for (var i = 0; i < 5; i++) {
        var date = get_day(
            new Date(checks_data[0].date).getTime() + 1000 * 60 * 60 * 24 * i
        );
        days[date] = [];
        days_indexes.push(date);
    }

    var day = days_indexes[0];
    var days_index = 0;
    var checked_in = false;
    var out = false;

    for (var check of checks_data) {
        while (get_day(check.time) != day) {
            if (days_index > Object.keys(days).length) {
                out = true;
            }

            // New day
            days_index++;

            if (checked_in) {
                var last_checks = days[days_indexes[days_index - 1]];
                var last_check = last_checks[last_checks.length - 1];
                var midnight = new Date(last_check.time);
                midnight.setHours(17);
                midnight.setMinutes(0);

                days[days_indexes[days_index - 1]].push({
                    check_in: false,
                    time: midnight.getTime(),
                });

                var morning = new Date(days_indexes[days_index]);
                morning.setHours(7) <
                    days[days_indexes[days_index]].push({
                        check_in: true,
                        project: last_check.project,
                        time: morning.getTime(),
                    });
            }

            /* day = get_day(check.time); */
            day = days_indexes[days_index];
            /* checked_in = false; */
        }

        if (out) {
            break;
        }
        if (check.check_in != checked_in) {
            days[days_indexes[days_index]].push(check);
            checked_in = check.check_in;
        }
    }

    if (me.checked_in) {
        var today_in_days = days[get_day(Date.now())];
        if (today_in_days) {
            today_in_days.push({
                check_in: false,
                time: Date.now(),
            });
        }
    }

    var standing_color = me.work.standing > 0 ? '#03fc4e' : '#fc0339';
    var summary = document.getElementById('week-summary');
    var projects_info = '';
    for (var project of me.projects) {
        projects_info += `<span class="project-info">
        <div class="color-blob" style="background:linear-gradient(90deg, ${project.color_bot}, ${project.color_top} 200%);"></div>
        <span class="project-info-text"><span style="color:grey;">${project.name.toUpperCase()}</span> <span class="project-time-info">${format_time(project.work_this_week)}</span></span>
        `;
    }

    summary.innerHTML = `<span id="title-info"><span style="color:grey;">Week ${
        me.work.this_week.week
    }:</span> ${format_time(me.work.this_week.time)}
    <svg xmlns="http://www.w3.org/2000/svg" id="standing-arrow" style="fill: ${standing_color}; transform:rotate(${
        me.work.standing > 0 ? '-90deg' : '90deg'
    })" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"/><path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4z"/></svg>
     <span style="color:${standing_color}">${Math.abs(me.work.standing)}%</span>
    </span>
        ${projects_info}
    </span>
    `;


    summary.title = `Last week: ${format_time(me.work.last_week.time)}, ${
        me.work.last_week.days
    } active days, ${me.work.standing}% predicted standing`;

    render_history();

    function get_day(ms) {
        var date = new Date(ms);
        return (
            date.getMonth() +
            1 +
            '.' +
            date.getDate() +
            '.' +
            date.getFullYear()
        );
    }
}

var history_progress = undefined;
var total_width = 0;
var check_bounds = [];
var rendered_canvas = new Image();
var names_of_days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Draws the graph for attendance
 * @param {boolean} clear Used to check if the background should be cleared.
 */

function render_history(clear = true) {
    //Array containing the bounds of the drawn, needed in order to check if you are hovering over the drawn bars
    check_bounds = [];
    //The width of the drawn bar
    var drawn_width = 0;
    //Get the canvas from the html document
    var canvas = document.getElementById('history');
    var ctx = canvas.getContext('2d');

    resize_canvas(canvas);

    //If clear is true, the background will be cleared
    if (clear) ctx.clearRect(0, 0, canvas.width, canvas.height);

    var height = canvas.height;
    var margin = 50;
    //The canvas will draw between these two hours
    var hours = [7, 20];
    //Width of each hour part drawn in the canvas
    var hours_width = (canvas.width - margin * 2) / (hours[1] - hours[0] - 1); // px

    var margin_top = canvas.height / 10;

    var day_height =
        (canvas.height - margin_top - margin * 2) / Object.keys(days).length;

    ctx.fillStyle = 'grey';
    ctx.font = '10px Roboto';
    ctx.textAlign = 'center';
    //Draws the vertical lines and prints out the hours
    for (var i = 0; i < hours[1] - hours[0]; i++) {
        ctx.fillRect(i * hours_width + margin, margin, 2, height - margin * 2);
        ctx.fillText(i + hours[0], i * hours_width + margin, margin - 10);
    }

    if (days) {
        //Draws the rows with different days
        for (var i = 0; i < Object.keys(days).length; i++) {
            ctx.fillStyle = 'grey';
            ctx.textAlign = 'right';

            var day_in_date = new Date(days_indexes[i]);
            //Writes out the day of the week
            ctx.fillText(
                names_of_days[day_in_date.getDay()],
                margin - 10,
                i * day_height + margin_top + margin + 15
            );

            var check_in = false;
            var check_in_date;
            var project;
            for (var check of days[days_indexes[i]]) {
                // Creates a gray gradient
                var gradient = ctx.createLinearGradient(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );
                gradient.addColorStop(0, dark ? '#4f4f4f' : '#ededed');
                gradient.addColorStop(1, dark ? '#3b3b3b' : '#dbdbdb');

                // If a project has been specified in the token
                if (project) {
                    project = get_project(project);
                    // If the project specified could be found
                    if (project) {
                        gradient = ctx.createLinearGradient(
                            0,
                            0,
                            canvas.width,
                            canvas.height
                        );
                        gradient.addColorStop(0, project.color_top);
                        gradient.addColorStop(1, project.color_bot);
                    }
                }

                if (check.check_in) {
                    check_in = true;
                    check_in_date = new Date(check.time);
                    project = check.project;
                } else if (!check.check_in && check_in) {
                    ctx.fillStyle = gradient;
                    var check_out_date = new Date(check.time);
                    var start_x =
                        (check_in_date.getHours() - hours[0]) * hours_width +
                        margin +
                        (check_in_date.getMinutes() / 60) * hours_width;
                    var stop_x =
                        (check_out_date.getHours() - hours[0]) * hours_width +
                        margin +
                        (check_out_date.getMinutes() / 60) * hours_width;

                    if (history_progress === undefined)
                        total_width += stop_x - start_x;
                    else {
                        if (
                            check_out_date.getTime() - check_in_date.getTime() >
                            1000 * 60 * 10
                        ) {
                            var width_left =
                                total_width * (history_progress * 1.05) -
                                drawn_width;

                            if (width_left <= 0) {
                                break;
                            }
                            var width = stop_x - start_x;

                            if (width > width_left) {
                                width = width_left;
                            }

                            ctx.roundRect(
                                start_x,
                                margin + margin_top + i * day_height,
                                width,
                                20,
                                100
                            ).fill();
                            drawn_width += width;

                            // Last frame save bounding boxes
                            check_bounds.push({
                                x: start_x,
                                y: margin + margin_top + i * day_height,
                                width: width,
                                height: 20,
                                project: project,
                                check_in: check_in_date,
                                check_out: check_out_date,
                            });
                        }
                    }
                }
            }
        }

        /*         ctx.fillStyle = dark ? '#d1d1d1' : '#454545';
        ctx.font = ctx.font = `20px Ubuntu`;
        ctx.textAlign = 'left';
        ctx.fillText(format_time(work), 25, canvas.height - 10); */

        if (!history_progress || history_progress < 1) {
            if (history_progress === undefined) history_progress = 0;
            history_progress += 0.06 - history_progress * 0.059;
            requestAnimationFrame(render_history);
        } else rendered_canvas.src = canvas.toDataURL();
    }
}

var rendering_info = false;

function update_hover_view() {
    if (rendering_info) {
        render_history(true);
        rendering_info = false;
    }
    var canvas = document.getElementById('history');
    var ctx = canvas.getContext('2d');

    // Get mouse position relative to canvas
    var rect = canvas.getBoundingClientRect();
    var mouse_on_canvas = {
        x: mouse.x - rect.left,
        y: mouse.y - rect.top,
    };

    var outline_width = 3;
    var box;
    // Detect bound block and draw outline
    for (var bound of check_bounds) {
        if (
            mouse_on_canvas.x > bound.x &&
            mouse_on_canvas.y > bound.y &&
            mouse_on_canvas.x < bound.x + bound.width &&
            mouse_on_canvas.y < bound.y + bound.height
        ) {
            box = bound;
            var project_color = box.project
                ? box.project.color_bot
                : dark
                ? '#e0e0e0'
                : 'grey';
            ctx.strokeStyle = project_color;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (var b of check_bounds) {
                if (b.project == bound.project) {
                    ctx.roundRect(
                        b.x - outline_width,
                        b.y - outline_width,
                        b.width + outline_width * 2,
                        b.height + outline_width * 2,
                        100
                    ).stroke();
                }
            }

            rendering_info = true;
        }
    }

    if (box) {
        // Draw info box
        var box_height = 50;
        var box_top = -10;
        var box_left = 15;

        var box_x = box.x + box_left;
        var box_y = box.y + (box_top - box_height);

        // Assemble and measure texts
        var title_size = 18;
        ctx.font = `${title_size}px Ubuntu`;
        var title_x = box_x + 10;
        var title_y = box_y + 20;
        var title = box.project ? box.project.name.toUpperCase() : 'ATTENDANCE';

        ctx.textAlign = 'left';

        var title_width = ctx.measureText(title).width;

        var day = names_of_days[box.check_in.getDay()].toUpperCase();
        var check_in = `${force_length(box.check_in.getHours())}:${force_length(
            box.check_in.getMinutes()
        )}`;
        var check_out = `${force_length(
            box.check_out.getHours()
        )}:${force_length(box.check_out.getMinutes())}`;
        var bottom_text = `${format_time(
            box.check_out.getTime() - box.check_in.getTime()
        )} ${day} ${check_in} - ${check_out}`;

        ctx.font = 'italic 13px Georga';
        var bottom_text_width = ctx.measureText(bottom_text).width;
        var box_width =
            bottom_text_width > title_width ? bottom_text_width : title_width;
        box_width += 20;

        ctx.save();
        canvas.style.cursor = 'pointer';
        render_history(false);

        //Create extra canvas, which is a copy of the drawn image in order to blur the background of the info-box
        var temp_canvas = document.createElement('canvas');
        temp_canvas.width = canvas.width;
        temp_canvas.height = canvas.height;
        var temp_ctx = temp_canvas.getContext('2d');
        temp_ctx.filter = 'blur(2.5px)';
        temp_ctx.fillStyle = dark ? '#111' : 'white';
        temp_ctx.fillRect(0, 0, temp_canvas.width, temp_canvas.height);
        temp_ctx.drawImage(rendered_canvas, 0, 0);
        temp_ctx.fillStyle = `rgba(${
            dark ? '20, 20, 20' : '255 , 255 , 255'
        }, .5)`;
        temp_ctx.fillRect(0, 0, temp_canvas.width, temp_canvas.height);

        ctx.roundRect(box_x, box_y, box_width, box_height, 10).fill();

        ctx.clip();

        ctx.drawImage(
            temp_canvas,
            box_x,
            box_y,
            box_width,
            box_height,
            box_x,
            box_y,
            box_width,
            box_height
        );

        ctx.restore();

        ctx.strokeStyle = project_color;
        ctx.roundRect(box_x, box_y, box_width, box_height, 10).stroke();

        // Draw title background
        ctx.font = `${title_size}px Ubuntu`;
        ctx.fillStyle = project_color;
        ctx.fillText(title, title_x, title_y);
        ctx.fillStyle = dark ? 'white' : 'black';
        ctx.font = 'italic 13px Georga';

        ctx.fillText(bottom_text, title_x, title_y + 18);
    } else {
        canvas.style.cursor = null;
    }
}

/**
 * Calcualte time of checks
 * @param {*} checks List of checks to count
 * @param {*} project Limit to only one project ID
 */
function calcualte_time(checks, project = undefined) {
    var checked_in = false;
    var checked_in_date = false;
    var checked_in_project = false;

    var time = 0;
    for (var check of checks) {
        if (check.check_in) {
            checked_in = true;
            checked_in_date = new Date(check.date);
            checked_in_project = check.project;
        } else {
            if (checked_in) {
                if (checked_in_project == project || project === undefined)
                    time +=
                        new Date(check.date).getTime() -
                        checked_in_date.getTime();
                checked_in = false;
                checked_in_date = false;
                checked_in_project = false;
            }
        }
    }
    return time;
}

CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
};

var checks_data;

var time_el = document.getElementById('time');
var sec_bar = document.getElementById('seconds-bar');

function update_clock() {
    var time = new Date();
    time_el.innerText =
        force_length(time.getHours()) + ':' + force_length(time.getMinutes());
    sec_bar.style.width =
        ((time.getSeconds() + time.getMilliseconds() / 1000) / 60) * 101 + 'px';
}

function force_length(val) {
    return val.toString().length == 2 ? val.toString() : '0' + val.toString();
}

on_login = () => {
    if (me.slack_id) document.getElementById('slack-button').remove();
    update_checked_in_status(me.checked_in);
    document.getElementById('avatar').src = me.avatar
        ? me.avatar
        : 'img/avatar.png';
    document.getElementById('logged-in-as').innerText =
        'Logged in as ' + me.name + ' (' + me.username + ')';

    insert_projects();

    axios
        .get('/api/user/checks', {
            params: {
                token,
            },
        })
        .then(res => {
            checks_data = res.data.checks;
            format_days();
        });
};

function insert_projects() {
    var projects = '';
    for (var project of me.projects) {
        projects += `<div class="project" hover="false" project-name="${
            project.name
        }"><span class="project-name">${project.name.toUpperCase()}</span><canvas height="50" width="200" class="project-timeline"></canvas><button class="project-button mdc-button mdc-button--outlined" onclick="check_in_project('${
            project.name
        }')">${
            me.checked_in_project == project.name
                ? get_button_text()
                : 'check in'
        }</button><svg version="1.1" class="wipe" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 500 500" style="enable-background:new 0 0 500 500;" xml:space="preserve"> <defs> <linearGradient id="${
            project.name
        }-gradient" x2="0.35" y2="1"><stop offset="0%" id="${
            project.name
        }-stop-0" stop-color="#b5b5b5"></stop> <stop offset="100%" id="${
            project.name
        }-stop-1" stop-color="#4a4a4a"></stop> </linearGradient> </defs> <path class="st0" d="M-14.9-64.8c0,0-40.3,578.2,578.2,578.2s568.6,0,568.6,0l1.9,327l-1242.7,13.4l-47.9-993.4L-14.9-64.8z"></path> </svg></div>`;
    }

    document.getElementById('projects').innerHTML = projects;
    for (el of document.getElementsByClassName('project')) {
        light_up_project(el, false, false);
    }

    update_projects(me.checked_in, me.checked_in_project);
}

function reload_dash() {
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
                insert_projects();
            }
        });
}

var hovering = false;
var mouse = {
    x: 0,
    y: 0,
};

document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if (me) {
        update_hover_view();
        var hover;
        for (var el of e.composedPath()) {
            if (el.getAttribute) {
                if (el.getAttribute('project-name')) {
                    hover = el;
                    if (el.getAttribute('hover') == 'false') {
                        el.setAttribute('hover', true);
                        light_up_project(el);
                        hovering = true;
                    }
                }
            }
        }

        if (hovering) {
            var hovering_found = false;
            for (var el of document.getElementsByClassName('project')) {
                if (
                    me.checked_in_project != el.getAttribute('project-name') &&
                    hover != el
                ) {
                    hovering_found = true;
                    el.setAttribute('hover', false);
                    light_up_project(el, false, false);
                } else {
                    hovering_found = true;
                }
            }
            if (!hovering_found) {
                /* if(interval) clearInterval(interval) */
                hovering = false;
            }
        }
    }
});

function check_in() {
    //Checks in user.
    axios
        .post('/api/user/check', {
            token: token,
        })
        .then(res => {
            var data = res.data;
            me.checked_in = data.checked_in;
            me.checked_in_time = 0;
            notice(data.text, data.success);
            if (!data.checked_in) me.checked_in_project = '';
            update_projects(data.checked_in);
            update_checked_in_status(data.checked_in);
        });
}

function render_canvas(canvas, project, progress = 0) {
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    var margin = 10; // px
    var max = 1;
    var min = 0;
    var dot_size = 3;
    ctx.lineWidth = 2;
    var spacing = (canvas.width - margin * 2) / (project.activity.length - 1);

    for (var pro of me.projects) {
        for (var day of pro.activity) {
            if (day > max) max = day;
        }
    }

    var difference = max - min;

    var grey_gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
    );
    grey_gradient.addColorStop(0, dark ? '#d9d9d9' : '#b5b5b5');
    grey_gradient.addColorStop(1, dark ? '#bfbfbf' : '#4a4a4a');

    var gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, project.color_top);
    gradient.addColorStop(1, project.color_bot);

    ctx.clearRect(0, 0, width, height); // Clear canvas

    var pos_x = margin;
    var activity = [];

    for (var i = 0; i < project.activity.length; i++) {
        var day = project.activity[i];

        var value = (day - min) / difference;
        var top = value * (canvas.height - margin * 2);
        activity[i] = {
            value: day,
        };
        activity[i].y = canvas.height - margin * 2 - top + margin;
        activity[i].x = pos_x;
        pos_x += spacing;
    }

    for (var i = 0; i < activity.length; i++) {
        var day = activity[i];

        if (progress < (i + 1) / activity.length) {
            ctx.strokeStyle = grey_gradient;
            ctx.fillStyle = grey_gradient;
        } else {
            ctx.fillStyle = gradient;
            ctx.strokeStyle = gradient;
        }

        ctx.beginPath();
        ctx.moveTo(day.x + dot_size / 2, day.y + dot_size / 2);
        if (activity[i + 1])
            ctx.lineTo(
                activity[i + 1].x + dot_size / 2,
                activity[i + 1].y + dot_size / 2
            );
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(
            day.x + dot_size / 2,
            day.y + dot_size / 2,
            dot_size,
            0,
            2 * Math.PI
        );
        ctx.fill();
    }
}

function light_up_project(el, light_up = true, animate = true) {
    var project_name = el.getAttribute('project-name');
    var project = get_project_from_name(project_name);

    var gradient = [
        light_up ? project.color_top : dark ? '#404040' : '#b5b5b5',
        light_up ? project.color_bot : dark ? '#5c5c5c' : '#757575',
    ];
    el.children[3].style.fill = 'url(#' + project.name + '-gradient)';
    document
        .getElementById(project.name + '-stop-0')
        .setAttribute('stop-color', gradient[0]);
    document
        .getElementById(project.name + '-stop-1')
        .setAttribute('stop-color', gradient[1]);
    var text = el.children[0];

    text.style.color = gradient[1];

    if (animate) {
        var speed = 0.2;
        var progress = light_up ? 0 : 1;
        var interval = setInterval(() => {
            if (progress > 1 || progress < 0) {
                clearInterval(interval);
                return;
            }
            render_canvas(el.children[1], project, progress);
            progress += light_up ? speed : -speed;
        }, 30);
    } else {
        render_canvas(el.children[1], project, light_up ? 1 : 0);
    }
}

function get_project(id) {
    for (var project of me.projects) {
        if (project.id == id) return project;
    }
    return false;
}

function get_project_from_name(name) {
    for (var project of me.projects) {
        if (project.name == name) return project;
    }
    return false;
}

function check_in_project(project_name) {
    var check_in = me.checked_in_project == project_name ? false : true;

    //Checks in user to project.
    axios
        .post('/api/user/check', {
            token: token,
            check_in: check_in,
            project: project_name,
        })
        .then(res => {
            var data = res.data;
            notice(data.text, data.success);
            if (data.success) {
                if (check_in) me.checked_in_time = 0;
                me.checked_in_project = check_in ? project_name : '';
                me.checked_in = check_in;
                for(var i = 0; i < me.projects.length; i++){
                    var project = me.projects[i]
                    if(project.name.toLowerCase() == project_name.toLowerCase()){
                        me.projects.splice(i, 1)
                        me.projects.unshift(project)
                    }
                    
                }
                insert_projects()
                update_projects(check_in, project_name);
            }
        });
}

function update_projects(checked_in, project_name) {
    for (var el of document.getElementsByClassName('project')) {
        render_canvas(
            el.children[1],
            get_project_from_name(el.getAttribute('project-name'))
        );
        if (el.getAttribute('project-name') == me.checked_in_project) {
            light_up_project(el);
        }
        if (el.getAttribute('project-name') != project_name) {
            light_up_project(el, false, false);
            el.children[2].innerText = 'Check in';
        } else {
            el.children[2].innerText = get_button_text();
        }
    }
    update_checked_in_status(checked_in);
}

/* Updates the main button status */
function update_checked_in_status(checked_in) {
    var check_in_button = document.getElementById('check-in-button');
    if (checked_in) {
        check_in_button.classList.add('mdc-button--outlined');
        check_in_button.classList.remove('mdc-button--raised');
    } else {
        check_in_button.classList.remove('mdc-button--outlined');
        check_in_button.classList.add('mdc-button--raised');
    }
    check_in_button.innerText = get_button_text();
}

function get_button_text() {
    return me.checked_in
        ? 'CHECK OUT (' + format_time(me.checked_in_time) + ')'
        : 'CHECK IN';
}

function new_project() {
    var project = prompt('Choose a name of the project: ');
    if (project) {
        //Creates new project
        axios
            .post('/api/project', {
                project,
                token,
            })
            .then(res => {
                var data = res.data;
                notice(data.text, data.success);
                reload_dash();
            });
    }
}

update_clock();
setInterval(() => {
    // Update the clock 2 times a second
    update_clock();
}, 500);

// Update history every minute
setTimeout(() => {
    setInterval(() => {
        format_days();
        render_history();
    }, 1000 * 60);
}, 1000 * 60);
