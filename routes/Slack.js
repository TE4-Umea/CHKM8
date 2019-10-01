class Slack {
//test
    constructor(server) {

        server.app.get("/auth", async (req, res) => {
            server.SlackAPI.auth(req, res)
        })

        server.app.post("/api/slack/checkin", async (req, res) => {
            server.SlackAPI.check_in(req, res)
        })

        server.app.post("/api/slack/checkout", async (req, res) => {
            server.SlackAPI.check_out(req, res)
        })
        
        server.app.post("/api/slack/remove", async (req, res) => {
            server.SlackAPI.remove(req, res)
        })
        
        server.app.post("/api/slack/add", async (req, res) => {
            server.SlackAPI.add(req, res)
        })
        
        server.app.post("/api/slack/new", async (req, res) => {
            server.SlackAPI.new_project(req, res)
        })
        
        server.app.post("/api/slack/help", async (req, res) => {
            server.SlackAPI.help(req, res)
        })
        
        server.app.post("/api/slack/delete", async (req, res) => {
            server.SlackAPI.delete_project(req, res)
        })
        
        server.app.post("/api/slack/project", async (req, res) => {
            server.SlackAPI.project(req, res)
        })
    }
}

module.exports = Slack