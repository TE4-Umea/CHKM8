/**
 * Main script
 * This script logs in the user and connects to socket.io
 */

var me
var on_login = () => {}

var token = localStorage.getItem("token")
if (token) {
    axios.get("/api/user", {
        params: {
            token
        }
    }).then(res => {
        var data = res.data
        if (data.success) {
            me = data.profile
            on_login()
        } else {
            localStorage.removeItem("token")
            location.href = "/"
        }
    })
}


function logout() {
    localStorage.removeItem("token")
    location.href = "/login"
}

function notice(message, success = true) {
    var notice_box = document.createElement("div")
    notice_box.classList.add("notice")
    notice_box.classList.add((success ? "success" : "error"))
    var notice_text = document.createElement("span")
    notice_text.innerText = message
    notice_text.classList.add("notice-text")
    notice_box.appendChild(notice_text)
    var br = document.createElement("br")
    document.getElementById("notices").insertBefore(br, document.getElementById("notices").children[0])
    document.getElementById("notices").insertBefore(notice_box, document.getElementById("notices").children[0])

    setTimeout(() => {
        notice_box.style.top = "0px"
    }, 50)

    setTimeout(() => {
        notice_box.style.opacity = "0"
        setTimeout(() => {
            notice_box.remove()
            br.remove()
        }, 1000)
    }, 2000)
}