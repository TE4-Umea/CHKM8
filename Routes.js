class Routes{
    constructor(server){
        
        /* Website pages */
        server.app.get("/dashboard", (req, res) => {
            res.render("dashboard", {
                client_id: server.config.client_id
            })
        })

        server.app.get("/login", (req, res) => {
            res.render("login")
        })

        server.app.get("/docs", (req, res) => {
            res.end("Docs is being remade")
        })

        server.app.get("/edit", (req, res) => {
            res.render("edit")
        })

        server.app.get("/", (req, res) => {
            res.render("index")
        })

        // Bind the cdn folder to the webserver, everything in it is accessable via the website
        server.app.use(server.express.static(__dirname + '/cdn'))
        // Enable PUG rendering in the express app
        server.app.set('view engine', 'pug')


        /* REST API routes */
        server.app.post("/api/checkin", async (req, res) => {
            server.API.checkin(req, res)
        })

        server.app.post("/api/add", async (req, res) => {
            server.API.add(req, res)
        })

        server.app.post("/api/new", async (req, res) => {
            server.API.new_project(req, res)
        })

        server.app.post("/api/remove", async (req, res) => {
            server.API.remove(req, res)
        })

        server.app.post("/api/project", async (req, res) => {
            server.API.project(req, res)
        })

        server.app.post("/api/login", async (req, res) => {
            server.API.login(req, res)
        })

        server.app.post("/api/signup", async (req, res) => {
            server.API.signup(req, res)
        })

        server.app.post("/api/profile", async (req, res) => {
            server.API.profile(req, res)
        })

        server.app.post("/api/user", async (req, res) => {
            server.API.username_taken(req, res)
        })

        server.app.post("/api/sign", async (req, res) => {
            server.API.sign(req, res)
        })

        /**
         * Github WEBHOOK 
         * Change config:branch to false if you wish to disable the webhook.
         * The webhook does not confirm that it comes from github, so it's important to disable it for release.
         * TODO: Verify webhook request is from Github
         */
        server.app.post("/webhook", async (req, res) => {
            if(server.config.branch) require("child_process").exec("git pull origin " + server.config.branch)
        })

    }
}

module.exports = Routes;