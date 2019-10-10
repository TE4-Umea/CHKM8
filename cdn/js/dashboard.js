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
            }
        });
}

const mock_data = [ { "id": 1, "user": 9, "time": 1568272930552, "check_in": 1, "type": "web", "original_time": 1568272930552 }, { "id": 2, "user": 9, "time": 1568287231086, "check_in": 0, "type": "web", "original_time": 1568287231086 }, { "id": 20, "user": 9, "time": 1568318933943, "check_in": 0, "type": "web", "original_time": 1568318924047 }, { "id": 22, "user": 9, "time": 1568319132512, "check_in": 0, "type": "web", "original_time": 1568319131079 }, { "id": 24, "user": 9, "time": 1568320102649, "check_in": 0, "type": "web", "original_time": 1568320096003 }, { "id": 28, "user": 9, "time": 1568321029810, "check_in": 0, "type": "web", "original_time": 1568321010101 }, { "id": 32, "user": 9, "time": 1568321086190, "check_in": 0, "type": "web", "original_time": 1568321083239 }, { "id": 39, "user": 9, "time": 1568355601619, "check_in": 0, "type": "web", "original_time": 1568355585119 }, { "id": 45, "user": 9, "time": 1568357475449, "check_in": 1, "type": "web", "original_time": 1568357475448 }, { "id": 48, "user": 9, "time": 1568359923048, "check_in": 1, "type": "web", "original_time": 1568359866435 }, { "id": 50, "user": 9, "time": 1568360494922, "check_in": 0, "type": "web", "original_time": 1568360494921 }, { "id": 71, "user": 9, "time": 1568362819972, "check_in": 1, "type": "web", "original_time": 1568362819971 }, { "id": 73, "user": 9, "time": 1568365720248, "check_in": 1, "type": "web", "original_time": 1568365719352 }, { "id": 74, "user": 9, "time": 1568368496137, "check_in": 0, "type": "web", "original_time": 1568368496136 }, { "id": 77, "user": 9, "time": 1568371402882, "check_in": 1, "type": "web", "original_time": 1568371402882 }, { "id": 79, "user": 9, "time": 1568371795371, "check_in": 1, "type": "web", "original_time": 1568371793678 }, { "id": 81, "user": 9, "time": 1568374086562, "check_in": 1, "type": "web", "original_time": 1568374084965 }, { "id": 87, "user": 9, "time": 1568375936546, "check_in": 1, "type": "web", "original_time": 1568375930785 }, { "id": 89, "user": 9, "time": 1568377355940, "check_in": 1, "type": "web", "original_time": 1568377354785 }, { "id": 91, "user": 9, "time": 1568377765315, "check_in": 1, "type": "web", "original_time": 1568377762288 }, { "id": 94, "user": 9, "time": 1568378322861, "check_in": 1, "type": "web", "original_time": 1568378321894 }, { "id": 96, "user": 9, "time": 1568381310040, "check_in": 0, "type": "web", "original_time": 1568381310038 }, { "id": 100, "user": 9, "time": 1568382760410, "check_in": 0, "type": "web", "original_time": 1568382759474 }, { "id": 101, "user": 9, "time": 1568614297278, "check_in": 1, "type": "web", "original_time": 1568614297277 }, { "id": 113, "user": 9, "time": 1568615863139, "check_in": 1, "type": "web", "original_time": 1568615859882 }, { "id": 121, "user": 9, "time": 1568615970424, "check_in": 1, "type": "web", "original_time": 1568615960831 }, { "id": 128, "user": 9, "time": 1568627214677, "check_in": 0, "type": "card", "original_time": 1568627214674 }, { "id": 131, "user": 9, "time": 1568635634263, "check_in": 1, "type": "web", "original_time": 1568635634261 }, { "id": 136, "user": 9, "time": 1568702789299, "check_in": 0, "type": "web", "original_time": 1568702789297 }, { "id": 139, "user": 9, "time": 1568703987228, "check_in": 1, "type": "web", "original_time": 1568703987226 }, { "id": 152, "user": 9, "time": 1568729974138, "check_in": 0, "type": "card", "original_time": 1568729974135 }, { "id": 153, "user": 9, "time": 1568787516529, "check_in": 1, "type": "card", "original_time": 1568787516526 }, { "id": 163, "user": 9, "time": 1568793696906, "check_in": 1, "type": "web", "original_time": 1568793695605 }, { "id": 165, "user": 9, "time": 1568794073926, "check_in": 1, "type": "web", "original_time": 1568794073059 }, { "id": 168, "user": 9, "time": 1568821819711, "check_in": 0, "type": "card", "original_time": 1568821819708 }, { "id": 169, "user": 9, "time": 1568873504233, "check_in": 1, "type": "card", "original_time": 1568873504230 }, { "id": 177, "user": 9, "time": 1568960152571, "check_in": 1, "type": "card", "original_time": 1568960137099 }, { "id": 185, "user": 9, "time": 1568994802705, "check_in": 0, "type": "card", "original_time": 1568994802702 }, { "id": 186, "user": 9, "time": 1569219186712, "check_in": 1, "type": "card", "original_time": 1569219186709 }, { "id": 191, "user": 9, "time": 1569232076306, "check_in": 0, "type": "card", "original_time": 1569232076303 }, { "id": 192, "user": 9, "time": 1569244798002, "check_in": 1, "type": "card", "original_time": 1569244797998 }, { "id": 193, "user": 9, "time": 1569253712484, "check_in": 0, "type": "card", "original_time": 1569253712481 }, { "id": 197, "user": 9, "time": 1569305921812, "check_in": 1, "type": "card", "original_time": 1569305921808 }, { "id": 200, "user": 9, "time": 1569320415356, "check_in": 0, "type": "card", "original_time": 1569320415352 }, { "id": 202, "user": 9, "time": 1569337051385, "check_in": 1, "type": "card", "original_time": 1569337051380 }, { "id": 204, "user": 9, "time": 1569337114762, "check_in": 0, "type": "card", "original_time": 1569337114758 }, { "id": 221, "user": 9, "time": 1570107386566, "check_in": 1, "type": "web", "original_time": 1570107359788 } ];

var days

function format_days(h) {
    if (h.length == 0) {
        render_history()
        return
    }
    // Days to export for render at most 5 days
    days = []
    window.days_indexes = []
    for (var i = 0; i < 5; i++) {
        var date = get_day(h[0].time + (1000 * 60 * 60 * 24) * i)
        days[date] = []
        days_indexes.push(date)
    }

    var day = get_day(h[0].time)
    var days_index = 0
    var checked_in = false
    var out = false

    for (var check of h) {
        while (get_day(check.time) != day) {
            if (days_index > days.length) {
                out = true
                break
            }
            // New day
            days_index++
            day = get_day(check.time)
            checked_in = false
        }
        if (out) break

        if (check.check_in != checked_in) {
            days[days_indexes[days_index]].push(check)
            checked_in = check.check_in
        }
    }



    if (me.checked_in) {
        var today_in_days = days[get_day(Date.now())]
        if (today_in_days) {
            today_in_days.push({
                check_in: false,
                time: Date.now(),
                original_time: Date.now()
            })
        }
    }

    render_history()

    function get_day(ms) {
        var date = new Date(ms)
        return date.getDate() + "." + date.getMonth() + "." + date.getFullYear()
    }
}

var history_progress = undefined
var total_width = 0

function render_history() {
    var drawn_width = 0
    var canvas = document.getElementById("history")
    var ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    var height = canvas.height
    var margin = 50
    var hours = [7, 18]
    var hours_width = (canvas.width - margin * 2) / (hours[1] - hours[0] - 1) // px
    var day_height = 50
    var margin_top = 25

    ctx.fillStyle = "grey"
    ctx.font = "Georgia 12px"
    ctx.textAlign = "center"
    for (var i = 0; i < hours[1] - hours[0]; i++) {
        ctx.fillRect((i * hours_width) + margin, margin, 2, height - (margin * 2))
        ctx.fillText(i + hours[0], i * hours_width + margin, margin - 10)
    }

    var names_of_days = ["Sun", "Mon", "Thu", "Wed", "Thu", "Fri", "Sat"]
    if (days) {
        for (var i = 0; i < Object.keys(days).length; i++) {
            ctx.fillStyle = "grey"
            ctx.textAlign = "right"
            var day_in_string = days_indexes[i].split(".")
            var day_in_date = new Date([Number(day_in_string[1]) + 1, day_in_string[0], day_in_string[2]].join("-"))
            ctx.fillText(names_of_days[day_in_date.getDay()], margin - 10, (i * day_height) + margin_top + margin + 15)

            //ctx.fillText(names_of_days[new Date(d.split(".").join("-"))].getDay(), 100, 100)
            var check_in = false
            var check_in_date
            for (var check of days[days_indexes[i]]) {
                if (check.check_in) {
                    check_in = true
                    check_in_date = new Date(check.original_time)
                } else if (!check.check_in && check_in) {
                    // Draw time
                    var gradient = ctx.createLinearGradient(20, 0, 220, 0);
                    gradient.addColorStop(0, '#21943b');
                    gradient.addColorStop(1, '#34eb5e');

                    ctx.fillStyle = gradient
                    var check_out_date = new Date(check.original_time)
                    var start_x = (check_in_date.getHours() - hours[0]) * hours_width + margin + (check_in_date.getMinutes() / 60 * hours_width)
                    var stop_x = (check_out_date.getHours() - hours[0]) * hours_width + margin + (check_out_date.getMinutes() / 60 * hours_width)
                    if (history_progress === undefined) total_width += stop_x - start_x
                    else {
                        var width_left = (total_width * history_progress) - drawn_width
                        if (width_left <= 0) break
                        var width = stop_x - start_x
                        if (width > width_left) width = width_left
                        drawn_width += width
                        ctx.roundRect(start_x, margin + margin_top + (i * day_height), width, 20, 100).fill()
                    }
                }
            }
        }
        if (history_progress == undefined) history_progress = 0
        history_progress += .06 - (history_progress * .059)
        if (history_progress < 1) requestAnimationFrame(render_history)
    }
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
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
}

var time_el = document.getElementById('time');
var sec_bar = document.getElementById('seconds-bar');

function update_clock() {
    var time = new Date();
    time_el.innerText =
        force_length(time.getHours()) + ':' + force_length(time.getMinutes());
    sec_bar.style.width =
        ((time.getSeconds() + time.getMilliseconds() / 1000) / 60) * 100 + '%';
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

    format_days(mock_data);
};

/**
 * Creates a project card
 */
function insert_projects() {
    document.getElementById('projects').innerHTML = generate_project_cards(
        me.projects
    );
    for (el of document.getElementsByClassName('project')) {
        light_up_project(el, false, false);
    }

    update_projects(me.checked_in, me.checked_in_project);
}

/**
 * Generates a group of cards as html.
 * @param {array} projects json file of all projects.
 */
function generate_project_cards(projects) {
    var html = '';
    for (var project of projects) {
        html += generate_project_card(project);
    }
    return html;
}

/**
 * Generates html for a projects card.
 * @param {Object} project project object containing project details.
 */
function generate_project_card(project) {
    //TODO
    return `<div class="project" hover="false" project-name="${
        project.name
    }"><div class='project-content'><div class='project-upper-row'><span class="project-name">${
        project.name
    }</span><span id='${project.name +
        '_time'}'>${active_project_time()}</div><canvas class="project-timeline"></canvas></div><div class="project-buttons"><button class="project-check-button" onclick="check_in_project('${
        project.name
    }')">${
        me.checked_in_project == project.name ? get_button_text() : 'check in'
    }</button><button class="project-edit-button" onclick="open_modal('${
        project.name
    }')">Edit project</button></div></div>`;
}

/**
 * @returns will return a string of the corrent working time.
 */
function active_project_time() {
    return '0:00';
}

/**
 * Reloads the base page elements
 */
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
document.addEventListener('mousemove', e => {
    if (me) {
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
    var max = -1;
    var min = 0;
    var dot_size = 4;
    ctx.lineWidth = 3;
    var spacing = (canvas.width - margin * 2) / (project.activity.length - 1);

    for (var pro of me.projects) {
        for (var day of pro.activity) {
            if (day > max) max = day;
        }
    }

    var difference = max - min;

    var grey_gradient = ctx.createLinearGradient(0, 0, 0, 100);
    grey_gradient.addColorStop(0, '#b5b5b5');
    grey_gradient.addColorStop(1, '#4a4a4a');

    var gradient = ctx.createLinearGradient(0, 0, 0, 100);
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
        light_up ? project.color_top : '#b5b5b5',
        light_up ? project.color_bot : '#757575',
    ];
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
            render_canvas(el.getElementsByClassName("project-timeline")[0], project, progress);
            progress += light_up ? speed : -speed;
        }, 30);
    } else {
        render_canvas(el.getElementsByClassName("project-timeline")[0], project, light_up ? 1 : 0);
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
                
                update_projects(check_in, project_name);
            }
        });
}

function update_projects(checked_in, project_name) {
    for (var el of document.getElementsByClassName('project')) {
        render_canvas(
            el.getElementsByClassName("project-timeline")[0],
            get_project_from_name(el.getAttribute('project-name'))
        );
        if (el.getAttribute('project-name') == me.checked_in_project) {
            light_up_project(el);
        }
        if (el.getAttribute('project-name') != project_name) {
            light_up_project(el, false, false);
            el.getElementsByClassName("project-check-button")[0].innerText = 'Check in';
        } else {
            el.getElementsByClassName("project-check-button")[0].innerText = get_button_text();
        }
    }
    update_checked_in_status(checked_in);
}

/* Updates the main button status */
function update_checked_in_status(checked_in) {
    var check_in_button = document.getElementById('check-in-button');
    if (checked_in) {
        check_in_button.classList.add('button-active');
    } else {
        check_in_button.classList.remove('button-active');
    }

    check_in_button.innerText = get_button_text();
}

function get_button_text() {
    return me.checked_in ? 'CHECK OUT' : 'CHECK IN';
}

function format_time(ms) {
    var hours = Math.floor(ms / 1000 / 60 / 60);
    var minutes = Math.floor(ms / 1000 / 60 - hours * 60);
    return (hours ? hours + 'h ' : '') + minutes + 'm';
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
    update_clock();
}, 500);

function open_modal(project_name) {
    var overlay = document.getElementById("overlay");

    overlay.classList.add("open");
}