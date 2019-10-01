class Webhook {
    constructor(server) {
        /**
         * Github WEBHOOK 
         * Change config:branch to false if you wish to disable the webhook.
         * The webhook does not confirm that it comes from github, so it's important to disable it for release.
         * TODO: Verify webhook request is from Github
         */
        server.app.post("/webhook", async (req, res) => {
            if (server.config.branch) require("child_process").exec("git pull origin " + server.config.branch)
        })
    }
}

module.exports = Webhook