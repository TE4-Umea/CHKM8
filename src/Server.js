/**
 * CHKM8 Server class
 * Remember to comment your code, always in comment blocks! (aka. SLASH + STAR + STAR Comment STAR + SLASH)
 * Here we use underscore_case for variable names and function names (variable_name, function_name())
 * PascalCase for classes and UPPER_CASE for constants
 */

class Server {
    constructor(config) {
        this.config = config;

        /** Load libraries */

        /** MD5 is an easy way to encrpyt text (passwords) */
        this.md5 = require('md5');
        /** Body parser parses incoming traffic via express for easy use with the JSON format. */
        this.bp = require('body-parser');
        /** Express, http and https allowes us to host the API, SlackAPI, Website and Webhook */
        this.express = require('express');
        this.http = require('http');
        this.https = require('https');
        /** File system is used to read and write files (used for config) */
        this.fs = require('file-system');
        /** Crypto generates a random hash that can be used as tokens (Way better than md5(random)) Use the function server.hash() to generate a new one. */
        this.crypto = require('crypto');

        /**  Slack API functions (routes are in /routes/Slack) */
        this.SlackAPI = require('./controllers/SlackApiController');
        this.SlackAPI = new this.SlackAPI(this);


        /** Database async handler */
        var Database = require('./Database');
        /** Setup db handler with config */
        this.db = new Database(this.config);

        /** Use port from config.json as the webport */
        this.port = this.config.port;

        /** Setup the web server via express */
        this.app = this.express();

        /** Use body-parser to read json/type in post / get requests */
        this.app.use(this.bp.json());
        this.app.use(
            this.bp.urlencoded({
                extended: true,
            })
        );

        /** Create the server and start it on the port in config.json */
        this.server = this.http.createServer(this.app).listen(this.port);

        /**  Bind the cdn folder to the webserver, everything in it is accessable via the website */
        this.app.use(this.express.static('../cdn'));

        /** Load Controller class */
        new (require('./routes/Routes'))(this);

        this.Debug = new (require('./Debug'))();

        /** Loading done! */
        this.on_loaded();        
    }

    /**
     * This function runs when everything has been loaded.
     */
    on_loaded() {
        this.Debug.log(
            `CheckMate's TimeTracker has started on port: ${this.port}`
        );
    }

    /**
     * Create a new unique hash that can be used as a token
     * (currently used in user tokens, config tokens and slack-sign-tokens)
     * NOTE: This is WAY safer and more random than md5(random)!
     */
    hash() {
        return this.crypto
            .randomBytes(20)
            .toString('hex')
            .toUpperCase();
    }

    /** Reformat time from ms to hours and minutes (string friendly) */
    format_time(ms) {
        var hours = Math.floor(ms / 1000 / 60 / 60);
        var minutes = Math.floor(ms / 1000 / 60 - hours * 60);
        return (hours ? hours + 'h ' : '') + minutes + 'm';
    }
}

module.exports = Server;
