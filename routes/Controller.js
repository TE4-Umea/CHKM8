class Controller {
    constructor(server) {
        // Enable PUG rendering in the express app
        server.app.set('view engine', 'pug');

        var REST = require('./REST');
        REST = new REST(server);

        var Website = require('./Website');
        Website = new Website(server);

        var Webhook = require('./Webhook');
        Webhook = new Webhook(server);

        var Slack = require('./Slack');
        Slack = new Slack(server);
    }
}

module.exports = Controller;
