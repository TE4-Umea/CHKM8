class User {
    /**
     * @property {Database} db
     * @property {JSONResponse} SuccessResponse
     * @property {JSONResponse} ErrorResponse
     */
    constructor() {
        // Declare bcrypt and salt
        this.bcrypt = require('bcrypt');
        this.salt_rounds = 10;

        this.crypto = require('crypto');
        this.fs = require('file-system');

        var ConfigLoader = require('./ConfigLoader');
        ConfigLoader = new ConfigLoader();

        this.Database = require('./Database');
        this.db = new this.Database(ConfigLoader.load());

        // JSONResponse is the standard response system for CHKM8
        this.JSONResponse = require('./models/JSONResponseModel');
        /* this.JSONResponse = new this.JSONResponse() */
        this.SuccessResponse = this.JSONResponse.SuccessResponse;
        this.ErrorResponse = this.JSONResponse.ErrorResponse;

        this.Debug = new (require('./Debug'))();

        this.Check = new (require('./Check'))();
    }

    /**
     * Get user from slack request, if they are not registered an account will be created.
     * @param {*} req Slack request
     * @returns {String}
     */
    hash() {
        return this.crypto
            .randomBytes(20)
            .toString('hex')
            .toUpperCase();
    }
    /**
     * 
     * @param {*} req 
     */
    async get_from_slack(req) {
        const SlackAPI = new (require('./controllers/SlackApiController'))();
        var success = SlackAPI.verify_slack_request(req);
        if (!success) {
            return false;
        }

        var body = req.body;
        var slack_id = body.user_id;
        var user = await this.get_from_slack_id(slack_id);
        if (user) {
            return user;
        } else {
            return false;
        }
    }

    /**
     * Create a new account in the database
     * @param {*} username Username of the account
     * @param {*} password Password of the account
     * @param {*} full_name Full name of the user
     * @param {String} username Username of the account
     * @param {String} password Password of the account
     * @param {String} full_name Full name of the user
     * @returns {Object}
     */
    async create(username, password, full_name) {
        var username_taken = await this.get_from_username(username);
        if (username_taken) return false;

        // Insert into the database
        var hash = this.bcrypt.hashSync(password, this.salt_rounds);
        this.db.query(
            'INSERT INTO users (username, name, password) VALUES (?, ?, ?)',
            [username, full_name, hash]
        );

        var user = await this.get_from_username(username);
        if (user) {
            this.Debug.log('Account created for ' + full_name);
            return user;
        }
    }

    /**
     * 
     * @param {String} username 
     * @param {String} password
     * @returns {Object|JSONResponse}
     */
    async get_from_username_and_password(username, password) {
        var user = await this.get_from_username(username);
        if (!user) {
            return false;
        }

        const match = await this.bcrypt.compare(password, user.password);
        if (match) {
            return user;
        }
    }

    /**
     * 
     * @param {String} username 
     * @param {String} ip
     * @returns {String|JSONResponse} user token | ErrorResponse if no user is found.
     */
    async generate_token(username, ip = '127.0.0.1') {
        var user = await this.get_from_username(username);
        if (user) {
            var token = this.hash();
            await this.db.query(
                'INSERT INTO tokens (token, user, ip) VALUES (?, ?, ?)',
                [token, user.id, ip]
            );
            return token;
        }
        return false;
    }

    /**
     * Deletes user from database identified by username.
     * @param {String} username username of the user to be deleted.
     * @returns {Boolean|JSONResponse} true on success | ErrorResponse on fail.
     */
    async delete(username) {
        var user = await this.get_from_username(username);
        if (user) {
            /* Delete user from the database */
            await this.db.query('DELETE FROM users WHERE id = ?', user.id);
            /* Delete all tokens belonging to the user */
            await this.db.query('DELETE FROM tokens WHERE user = ?', user.id);
            return true;
        }
        return false;
    }

    /**
     * Get user via their slack user id
     * @param {*} slack_id
     * @param {String} slack_id slack user id.
     * @returns {Object|Boolean} user object on success | false on fail
     */
    async get_from_slack_id(slack_id) {
        if (!slack_id) return false;
        var user = await this.db.query_one(
            'SELECT * FROM users WHERE slack_id = ?',
            slack_id
        );
        return user;
    }

    /**
     * Get a user from the database
     * @param {Int} user_id ID of the user
     * @returns {User} User
     * @param {Number} user_id ID of the user
     * @returns {Object|Boolean} user object from database | false if no user could be found.
     */
    async get(user_id) {
        if (!user_id) return false;
        var user = await this.db.query_one(
            'SELECT * FROM users WHERE id = ?',
            user_id
        );
        return user ? user : false;
    }

    /**
     * Get user from username
     * @param {*} username
     * @param {String} username 
     * @returns {Object|JSONResponse} user object from database | ErrorResponse on fail.
     */
    async get_from_username(username) {
        if (username) {
            var user = await this.db.query_one(
                'SELECT * FROM users WHERE upper(username) = ?',
                username.toUpperCase()
            );
            return user;
        }
        return false;
    }

    /**
     * Get user from token
     * @param {*} token
     * Get user from token
     * @param {String} token
     * @returns {User|JSONResponse}
     */
    async get_from_token(token) {
        if (!token) {
            return false;
        }

        var db_token = await this.db.query_one(
            'SELECT * FROM tokens WHERE token = ?',
            token
        );

        if (!db_token) {
            return false;
        }

        var user = await this.get(db_token.user);
        if (user) {
            return user;
        }
    }

    /**
     * Get user login info from token
     * @param {*} token
     * @param {String} token
     * @returns {User|JSONResponse}
     */
    async login_with_token(token) {
        // Get user from token
        var user = await this.get_from_token(token);
        if (user) {
            // Get user data
            var data = await this.get_data(user.id);
            return data;
        }
        return false;
    }

    /**
     * Get data from user id
     * @param {*} user_id
     * @param {Number} user_id
     * @returns {Object} user
     */
    async get_data(user_id) {
        var user = await this.get(user_id);
        if (user) {
            var Check = new (require('./Check'))(this);

            // Delete private information (user data is only sent to the authenticated user, but password and access token is not needed and
            // would be unnecessary to not hide)
            delete user.access_token;
            delete user.password;

            var last_check = await Check.get_last_check(user.id);
            /* console.log(last_check) */
            // Add new uncashed properties
            user.checked_in = await Check.is_checked_in(user.id);

            var Project = require('./Project');
            Project = new Project();
            var checked_in_project = await Project.get(last_check.project);
            user.checked_in_project = checked_in_project.name;
            user.checked_in_time = Date.now() - last_check.date;

            user.projects = [];
            var joints = await this.db.query(
                'SELECT * FROM joints WHERE user = ?',
                user.id
            );

            // Load and compile projects the user has joined.
            for (var joint of joints) {
                var project = await Project.get(joint.project);
                project.work = joint.work;
                project.activity = [
                    Math.random(),
                    Math.random(),
                    Math.random(),
                    Math.random(),
                    Math.random(),
                ];
                user.projects.push(project);
            }
            return user;
        }
    }
}

module.exports = User;
