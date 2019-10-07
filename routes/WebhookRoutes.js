class WebhookRoutes {
    constructor(server) {

        let Controller = new (require('../controllers/WebHookController'))();
        /**
         * Github WEBHOOK
         * Change config:branch to false if you wish to disable the webhook.
         * The webhook does not confirm that it comes from github, so it's important to disable it for release.
         * TODO: Verify webhook request is from Github
         */
        server.app.post('/webhook', Controller.index);
    }
}

module.exports = WebhookRoutes;
