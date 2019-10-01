class REST {
    constructor(server) {

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

    }
}

module.exports = REST