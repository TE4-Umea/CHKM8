class Controller {
    constructor(server) {
        // Enable PUG rendering in the express app
        server.app.set('view engine', 'pug');

        var REST = require('./RestRoutes');
        REST = new REST(server);

        var Website = require('./WebsiteRoutes');
        Website = new Website(server);

        var Webhook = require('./WebhookRoutes');
        Webhook = new Webhook(server);

        var Slack = require('./SlackRoutes');
        Slack = new Slack(server);
    }
}

module.exports = Controller;
