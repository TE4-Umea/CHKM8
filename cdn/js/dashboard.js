if (!token) location.href = "/login"
var sign_token = document.getElementById("slack-sign-token").innerText
if (sign_token) {
    //Links a Authenticated user with a slack user.
    axios.patch("/api/user/slack", {
        token,
        sign_token
    }).then(res => {
        var data = res.data
        if (data.success) {
            location.href = data.redir
        } else {
            alert(data.text)
        }
    })
}

var time_el = document.getElementById("time")
var sec_bar = document.getElementById("seconds-bar")

function update_clock() {
    var time = new Date()
    time_el.innerText = force_length(time.getHours()) + ":" + force_length(time.getMinutes())
    sec_bar.style.width = (((time.getSeconds() + (time.getMilliseconds() / 1000)) / 60) * 101) + "px"
}

function force_length(val) {
    return val.toString().length == 2 ? val.toString() : "0" + val.toString()
}

update_clock()
setInterval(() => {
    update_clock()
}, 500)

on_login = () => {
    if (me.slack_id) document.getElementById("slack-button").remove()
    update_checked_in_status(me.checked_in)
    document.getElementById("avatar").src = me.avatar ? me.avatar : "img/avatar.png"
    document.getElementById("logged-in-as").innerText = "Logged in as " + me.name + " (" + me.username + ")"

    insert_projects()
}

function insert_projects() {
    var projects = ""
    for (var project of me.projects) {
        projects += `<div class="project" hover="false" project-name="${project.name}"><span class="project-name">${project.name.toUpperCase()}</span><canvas height="50" width="200" class="project-timeline"></canvas><button class="project-button mdc-button mdc-button--outlined" onclick="check_in_project('${project.name}')">${me.checked_in_project == project.name ? get_button_text() : "check in"}</button><svg version="1.1" class="wipe" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 500 500" style="enable-background:new 0 0 500 500;" xml:space="preserve"> <defs> <linearGradient id="${project.name}-gradient" x2="0.35" y2="1"><stop offset="0%" id="${project.name}-stop-0" stop-color="#b5b5b5"></stop> <stop offset="100%" id="${project.name}-stop-1" stop-color="#4a4a4a"></stop> </linearGradient> </defs> <path class="st0" d="M-14.9-64.8c0,0-40.3,578.2,578.2,578.2s568.6,0,568.6,0l1.9,327l-1242.7,13.4l-47.9-993.4L-14.9-64.8z"></path> </svg></div>`
    }

    document.getElementById("projects").innerHTML = projects
    for (el of document.getElementsByClassName("project")) {
        light_up_project(el, false, false)
    }

    update_projects(me.checked_in, me.checked_in_project)
}

function reload_dash(){
    //Gets user data specified by token.
    axios.get("/api/user", {
        params: {
            token
        }
    }).then(res => {
        var data = res.data
        if (data.success) {
            me = data.profile
            insert_projects()
        }
    })
}


var hovering = false
document.addEventListener("mousemove", e => {
    if (me) {
        var hover
        for (var el of e.composedPath()) {
            if (el.getAttribute) {
                if (el.getAttribute("project-name")) {
                    hover = el
                    if (el.getAttribute("hover") == "false") {
                        el.setAttribute("hover", true)
                        light_up_project(el)
                        hovering = true
                    }
                }
            }
        }

        if (hovering) {
            var hovering_found = false
            for (var el of document.getElementsByClassName("project")) {
                if (me.checked_in_project != el.getAttribute("project-name") && hover != el) {
                    hovering_found = true
                    el.setAttribute("hover", false)
                    light_up_project(el, false, false)
                } else {
                    hovering_found = true
                }
            }
            if (!hovering_found) {
                /* if(interval) clearInterval(interval) */
                hovering = false
            }
        }
    }


})

function check_in() {
    //Checks in user.
    axios.post("/api/user/check", {
        token: token
    }).then(res => {
        var data = res.data
        me.checked_in = data.checked_in
        me.checked_in_time = 0
        notice(data.text, data.success)
        if (!data.checked_in) me.checked_in_project = ""
        update_projects(data.checked_in)
        update_checked_in_status(data.checked_in)
    })
}

function render_canvas(canvas, project, progress = 0) {
    var ctx = canvas.getContext("2d")
    var width = canvas.width
    var height = canvas.height
    var margin = 10 // px
    var max = -1
    var min = 0
    var dot_size = 4
    ctx.lineWidth = 3
    var spacing = ((canvas.width - margin * 2) / (project.activity.length - 1))

    for (var pro of me.projects) {
        for (var day of pro.activity) {
            if (day > max) max = day
        }
    }

    var difference = max - min

    var grey_gradient = ctx.createLinearGradient(0, 0, 0, 100);
    grey_gradient.addColorStop(0, "#b5b5b5");
    grey_gradient.addColorStop(1, "#4a4a4a");

    var gradient = ctx.createLinearGradient(0, 0, 0, 100);
    gradient.addColorStop(0, project.color_top);
    gradient.addColorStop(1, project.color_bot);

    ctx.clearRect(0, 0, width, height) // Clear canvas

    var pos_x = margin
    var activity = []

    for (var i = 0; i < project.activity.length; i++) {
        var day = project.activity[i]

        var value = ((day - min) / difference)
        var top = value * (canvas.height - margin * 2)
        activity[i] = {
            value: day
        }
        activity[i].y = ((canvas.height - margin * 2) - top) + margin
        activity[i].x = pos_x
        pos_x += spacing
    }

    for (var i = 0; i < activity.length; i++) {
        var day = activity[i]

        if (progress < ((i + 1) / activity.length)) {
            ctx.strokeStyle = grey_gradient
            ctx.fillStyle = grey_gradient
        } else {
            ctx.fillStyle = gradient;
            ctx.strokeStyle = gradient
        }

        ctx.beginPath()
        ctx.moveTo(day.x + dot_size / 2, day.y + dot_size / 2)
        if (activity[i + 1]) ctx.lineTo(activity[i + 1].x + dot_size / 2, activity[i + 1].y + dot_size / 2)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(day.x + dot_size / 2, day.y + dot_size / 2, dot_size, 0, 2 * Math.PI)
        ctx.fill()
    }
}


function light_up_project(el, light_up = true, animate = true) {

    var project_name = el.getAttribute("project-name")
    var project = get_project_from_name(project_name)

    var gradient = [light_up ? project.color_top : "#b5b5b5", light_up ? project.color_bot : "#757575"]
    el.children[3].style.fill = "url(#" + project.name + "-gradient)"
    document.getElementById(project.name + "-stop-0").setAttribute("stop-color", gradient[0])
    document.getElementById(project.name + "-stop-1").setAttribute("stop-color", gradient[1])
    var text = el.children[0]

    text.style.color = gradient[1]

    if (animate) {
        var speed = .2
        var progress = light_up ? 0 : 1
        var interval = setInterval(() => {
            if (progress > 1 || progress < 0) {
                clearInterval(interval)
                return
            }
            render_canvas(el.children[1], project, progress)
            progress += light_up ? speed : -speed
        }, 30)
    } else {
        render_canvas(el.children[1], project, light_up ? 1 : 0)
    }
}


function get_project(id) {
    for (var project of me.projects) {
        if (project.id == id) return project
    }
    return false
}

function get_project_from_name(name) {
    for (var project of me.projects) {
        if (project.name == name) return project
    }
    return false
}

function check_in_project(project_name) {
    var check_in = me.checked_in_project == project_name ? false : true

    //Checks in user to project.
    axios.post("/api/user/check", {
        token: token,
        check_in: check_in,
        project: project_name
    }).then(res => {
        var data = res.data
        notice(data.text, data.success)
        if (data.success) {
            if (check_in) me.checked_in_time = 0
            me.checked_in_project = check_in ? project_name : ""
            me.checked_in = check_in
            update_projects(check_in, project_name)
        }
    })
}

function update_projects(checked_in, project_name) {
    for (var el of document.getElementsByClassName("project")) {
        render_canvas(el.children[1], get_project_from_name(el.getAttribute("project-name")))
        if (el.getAttribute("project-name") == me.checked_in_project) {
            light_up_project(el)
        }
        if (el.getAttribute("project-name") != project_name) {
            light_up_project(el, false, false)
            el.children[2].innerText = "Check in"
        } else {
            el.children[2].innerText = get_button_text()
        }
    }
    update_checked_in_status(checked_in)
}

/* Updates the main button status */
function update_checked_in_status(checked_in) {
    var check_in_button = document.getElementById("check-in-button")
    if (checked_in) {
        check_in_button.classList.add("mdc-button--outlined")
        check_in_button.classList.remove("mdc-button--raised")
    } else {
        check_in_button.classList.remove("mdc-button--outlined")
        check_in_button.classList.add("mdc-button--raised")
    }

    check_in_button.innerText = get_button_text()
}

function get_button_text() {
    return me.checked_in ? "CHECK OUT (" + format_time(me.checked_in_time) + ")" : "CHECK IN"
}

function format_time(ms) {
    var hours = Math.floor(ms / 1000 / 60 / 60)
    var minutes = Math.floor((ms / 1000 / 60) - (hours * 60))
    return (hours ? hours + "h " : "") + minutes + "m"
}

function new_project() {
    var project = prompt("Choose a name of the project: ")
    if (project) {
        //Creates new project
        axios.post("/api/project", {
            project,
            token
        }).then(res => {
            var data = res.data
            notice(data.text, data.success)
            reload_dash()
        })
    }
}