class WebhookController {
    async index(req, res) {
        if (server.config.branch) {
            require('child_process').exec(
                'git pull origin ' + server.config.branch + ' --no-edit'
            );
            server.log('Reloading via webhook');
        }
    }
}

module.exports = WebhookController;
