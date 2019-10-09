class WebhookController {
    async index(req, res) {
        res.end('test2');
        
        const Debug = new (require('../Debug'))();
        const ConfigLoader = new (require('../ConfigLoader'))();
        console.log(req);
        var config = ConfigLoader.load();
        if (config.branch) {
            require('child_process').exec(
                'git pull origin ' + config.branch + ' --no-edit'
            );
            Debug.log('Reloading via webhook');
        }
    }
}

module.exports = WebhookController;
