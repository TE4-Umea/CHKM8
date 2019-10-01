var documentation
var md = window.markdownit({
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' +
                    hljs.highlight(lang, str, true).value +
                    '</code></pre>';
            } catch (__) {}
        }

        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
});

axios.get("/api/documentation").then(res => {
    documentation = res.data
    var list = ""
    var classes = ""
    for (var i = 0; i < documentation.length; i++) {
        var page = documentation[i]
        list += "<option value='" + i + "'>" + page.title + "</option>"
        if (page.type == "class") classes += "<option value='" + page.title + "'>" + page.title + "</option>"
    }
    document.getElementById("class").innerHTML += classes
    document.getElementById("load-page").innerHTML += list
})

function load(el) {
    var page = documentation[el.value]
    el.value = ""
    document.getElementById("text-area").value = page.text
    document.getElementById("title-input").value = page.title
    document.getElementById("type").value = page.type
    document.getElementById("pinned").checked = page.pinned
    document.getElementById("class").value = page.class ? page.class : ""
    document.getElementById("new-title").value = page.title
    preview({
        value: page.text
    })
    warn()
}

function update_title(el) {
    document.getElementById("new-title").value = el.value
    warn()
}


var overwrite = false

function warn() {
    var old_title = document.getElementById("title-input").value
    var new_title = document.getElementById("new-title").value
    overwrite = false
    for (var page of documentation) {
        if (page.title == old_title || page.title == new_title) overwrite = true
    }
    var button = document.getElementById("upload")
    if (overwrite) {
        button.style.borderColor = "#ff1a4f"
        button.style.color = "#ff1a4f"
        button.innerText = "OVERWRITE"
    } else {
        button.style.borderColor = null
        button.style.color = null
        button.innerText = "UPLOAD"
    }
}

function preview(el) {
    document.getElementById("preview").innerHTML = md.render(el.value)
}

function upload() {
    if (confirm("Are you sure you want to post?" + (overwrite ? " This will overwrite!" : ""))) {
        axios.post("/api/document", {
            token: token,
            text: document.getElementById("text-area").value,
            type: document.getElementById("type").value,
            pinned: document.getElementById("pinned").checked,
            old_title: document.getElementById("title-input").value,
            title: document.getElementById("new-title").value,
            class: document.getElementById("class").value ? document.getElementById("class").value : null
        }).then(res => {
            if(res.data.success){
                location.reload()
            } else {
                alert(res.data.text)
            }
            
        })

    }
}