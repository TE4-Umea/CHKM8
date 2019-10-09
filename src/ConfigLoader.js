class ConfigLoader {
    constructor() {
        /**
         * Create a new unique hash that can be used as a token
         * (currently used in user tokens, config tokens and slack-sign-tokens)
         */
        this.crypto = require('crypto');
        this.fs = require('file-system');
    }

    /**
     *
     * Configuration template. When adding new standards / properties
     * to the config, add them here.
     *
     * @param {*} path
     * @param {*} template
     */
    load(
        path = '../config.json',
        template = {
            // Port of the webserver and REST API
            port: 80,
            // Token for the REST API
            token: this.hash(),
            // Admin token
            admin_token: this.hash(),
            // Slack app info
            signing_secret: '*******',
            client_id: '00032323',
            client_secret: '********',
            // mySQL connection information
            mysql_host: 'localhost',
            mysql_user: 'admin',
            mysql_pass: 'password',
            // Github branch
            branch: 'master',
            // Database name
            database: 'time',
        }
    ) {
        var config = undefined;

        /**
         * Load or create config file.
         * If any property is missing it will be added.
         * NOTE: If the config is corrupt or invalid, it will be overwritten.
         */
        try {
            config = JSON.parse(this.fs.readFileSync(path));
            var updated = false;
            for (var key in template) {
                if (config[key] === undefined) {
                    config[key] = template[key];
                    updated = true;
                    console.log(
                        'Updated config.json with the missing option ' + key
                    );
                }
                if (updated)
                    this.fs.writeFileSync(path, JSON.stringify(config));
            }
        } catch (e) {
            console.log('Loading config.json failed, creating a default one.');
            this.fs.writeFileSync(path, JSON.stringify(template));
            config = template;
        }
        return config;
    }

    hash() {
        return this.crypto
            .randomBytes(20)
            .toString('hex')
            .toUpperCase();
    }
}

module.exports = ConfigLoader;
