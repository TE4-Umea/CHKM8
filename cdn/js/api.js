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

var documentation
axios.get("/api/documentation").then(res => {
    documentation = res.data

    var sidebar_html = ""
    for (var i = 0; i < documentation.length; i++) {
        var page = documentation[i]
        sidebar_html += "<div class='api-page " + page.type + "' onclick='visit(" + i + ")' page='" + i + "'> <img src='img/icons/" + page.type + ".png' class='api-icon-small'><span class='api-name'>" + page.title + "</span></div>"
    }
    document.getElementById("api-list").innerHTML = sidebar_html
    visit(0)
})

function visit(id) {
    var page = documentation[id]
    document.getElementById("api-page-title").innerText = page.title
    document.getElementById("about-page").innerHTML = md.render(page.text)
}