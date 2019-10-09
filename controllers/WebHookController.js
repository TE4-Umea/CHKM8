class WebhookController {
    async index(req, res) {
        const Debug = new (require('../Debug'))();
        const ConfigLoader = new (require('../ConfigLoader'))();
        var config = ConfigLoader.load();
        if (config.branch) {
            res.end('success');
            require('child_process').exec(
                'git pull origin ' + config.branch + ' --no-edit'
            );
            Debug.log('Reloading via webhook');
        }
    }
}

module.exports = WebhookController;
