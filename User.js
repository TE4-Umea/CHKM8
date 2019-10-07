class User {
    constructor() {
        this.md5 = require('md5');

        this.crypto = require('crypto');
        this.fs = require('file-system');

        var ConfigLoader = require('./ConfigLoader');
        ConfigLoader = new ConfigLoader();

        this.Database = require('./Database');
        this.db = new this.Database(ConfigLoader.load());

        this.Check = require('./Check');
        this.Check = new this.Check();
    }

    /**
     * Get user from slack request, if they are not registered an account will be created.
     * @param {*} req Slack request
     */
    hash() {
        return this.crypto
            .randomBytes(20)
            .toString('hex')
            .toUpperCase();
    }

    /**
     * Log message with timestamp
     * Use this when a log should stay in the code
     * @param {*} message
     */
    log(message) {
        /**  Dont display messages if it's in a test */
        if (this.isInTest) return;
        /**  Create timestamp */
        var date = new Date();
        /**  Display message with timestamp */
        console.log(
            `[${date.getDate()}/${date.getMonth() +
                1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}] ${message}`
        );
    }

    async get_from_slack(req) {
        var success = this.SlackAPI.verify_slack_request(req);
        if (success) {
            var body = req.body;
            var slack_id = body.user_id;
            var user = await this.get_from_slack_id(slack_id);
            if (user) {
                return user;
            } else {
                return false;
            }
        }
    }

    /**
     * Create a new account in the database
     * @param {*} username Username of the account
     * @param {*} password Password of the account
     * @param {*} full_name Full name of the user
     */
    async create(username, password, full_name) {
        var username_taken = await this.get_from_username(username);
        if (username_taken) {
            return {
                success: false,
                text: 'Username taken',
            };
        }
        // Insert into the database
        await this.db.query(
            'INSERT INTO users (username, name, password, created) VALUES (?, ?, ?, ?)',
            [username, full_name, this.md5(password), Date.now()]
        );
        var user = await this.get_from_username(username);
        if (user) {
            this.log('Account created for ' + full_name);
            return {
                success: true,
                user: user,
            };
        }
    }

    async get_from_username_and_password(username, password) {
        var user = await this.get_from_username(username);
        if (!user) {
            return new this.ErrorResponse(
                'User could not be found'
            );
        }
        
        if (user.password === this.md5(password)) return user;
        
        return new this.SuccessResponse('User successfully retrieved');
    }

    async generate_token(username) {
        var user = await this.get_from_username(username);
        if (user) {
            var token = this.hash();
            await this.db.query(
                'INSERT INTO tokens (token, user) VALUES (?, ?)',
                [token, user.id]
            );
            return token;
        }
        return false;
    }

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
     */
    async get(user_id) {
        var user = await this.db.query_one(
            'SELECT * FROM users WHERE id = ?',
            user_id
        );
        return user ? user : false;
    }

    /**
     * Get user from username
     * @param {*} username
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
     *
     * @param {*} token
     */
    async get_from_token(token) {
        if (!token) {
            return new this.ErrorResponse(
                'Invalid token'
            );
        }   

        var db_token = await this.db.query_one(
            'SELECT * FROM tokens WHERE token = ?',
            token
        );

        if (!db_token) {
            return new this.ErrorResponse(
                'Could not identify token' 
            );
        }
        
        var user = await this.get(db_token.user);
        if (user) {
            return user;
        }
        
        return new this.SuccessResponse('User successfully retrieved');
    }

    /**
     * Get user login info from token
     * @param {*} token
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
     *
     * @param {*} user_id
     */
    async get_data(user_id) {
        var user = await this.get(user_id);
        if (user) {
            // Delete private information (user data is only sent to the authenticated user, but password and access token is not needed and
            // would be unnecessary to not hide)
            delete user.access_token;
            delete user.password;

            var last_check = await this.Check.get_last_check(user.id);

            // Add new uncashed properties
            user.checked_in = await this.Check.is_checked_in(user.id);
            user.checked_in_project = last_check.project;
            user.checked_in_time = Date.now() - last_check.date;

            user.projects = [];
            var joints = await this.db.query(
                'SELECT * FROM joints WHERE user = ?',
                user.id
            );

            let project = require('./Project');
            project = new this.Project();

            // Load and compile projects the user has joined.
            for (var joint of joints) {
                let project = await project.get_from_id(joint.project);
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
