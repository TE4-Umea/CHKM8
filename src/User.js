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

        Date.prototype.getWeekNumber = function() {
            var d = new Date(
                Date.UTC(this.getFullYear(), this.getMonth(), this.getDate())
            );
            var dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
        };
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

            const UserCheckController = new (require('./controllers/user/UserCheckController'))();
            var today = new Date();
            today.setHours(23);
            today.setMinutes(59);
            today = Math.round(today.getTime() / 1000);

            var this_week_end = new Date();
            var this_week_start = this.get_monday(new Date());
            var last_week_start = new Date();
            last_week_start.setDate(-7);
            last_week_start = this.get_monday(last_week_start);

            var checks_this_week = await UserCheckController.fetch_checks(
                user_id,
                Math.round(this_week_start.getTime() / 1000),
                Math.round(this_week_end.getTime() / 1000)
            );

            var checks_last_week = await UserCheckController.fetch_checks(
                user_id,
                Math.round(last_week_start.getTime() / 1000),
                Math.round(this_week_start.getTime() / 1000)
            );

            var one_day = 60 * 60 * 24;

            // Load and compile projects the user has joined.
            for (var joint of joints) {
                var project = await Project.get(joint.project);
                project.work = joint.work;
                project.work_this_week = this.calcualte_time(
                    checks_this_week,
                    project.id
                );

                project.last_check_in = await this.db.query_one(
                    'SELECT date FROM checks WHERE user = ? AND project = ? ORDER BY id DESC LIMIT 1',
                    [user_id, project.id]
                );

                project.last_check_in = project.last_check_in ? project.last_check_in.date : 0;

                project.activity = [];

                var amount_in_history = 14;
                for (var i = 0; i < amount_in_history; i++) {
                    var checks = await UserCheckController.fetch_checks(
                        user_id,
                        today - one_day * (i + 1),
                        today - one_day * i
                    );

                    var time = this.calcualte_time(checks, joint.project);
                    project.activity[amount_in_history - 1 - i] = time;
                }
                user.projects.push(project);
            }

            user.work = {};
            user.work.this_week = {
                time: this.calcualte_time(checks_this_week),
                week: this_week_start.getWeekNumber(),
            };

            user.work.last_week = {
                time: this.calcualte_time(checks_last_week),
                week: user.work.this_week.week - 1,
            };

            user.work.last_week.days = this.get_days(checks_last_week);

            var day = new Date().getDay();
            day--;
            if (day == -1) day = 6;
            if (day > 4) day = 4;

            user.work.standing = (
                user.work.this_week.time /
                (user.work.last_week.time / (4 - day || 1))
            ).toFixed(2);

            user.work.standing =
                user.work.standing > 1
                    ? user.work.standing * 100 - 100
                    : -(100 - user.work.standing * 100);
            user.work.standing = user.work.standing.toFixed(2);

            user.projects = user.projects.sort((a, b) => {
                return b.last_check_in - a.last_check_in;
            });

            return user;
        }
    }

    getWeekNumber(d) {
        // Copy date so don't modify original
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        // Get first day of year
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        // Calculate full weeks to nearest Thursday
        var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
        // Return array of year and week number
        return [d.getUTCFullYear(), weekNo];
    }

    /**
     * Get how many days where active in an array of checks
     * @param {*} checks
     */
    get_days(checks = []) {
        var days = {};
        for (var check of checks) {
            var date = get_day(new Date(check.date).getTime());
            if (days[date]) continue;
            days[date] = true;
        }

        function get_day(ms) {
            var date = new Date(ms);
            return (
                date.getMonth() +
                1 +
                '.' +
                date.getDate() +
                '.' +
                date.getFullYear()
            );
        }

        return Object.keys(days).length;
    }

    get_monday(date) {
        var day = date.getDay() || 7;
        if (day !== 1) date.setHours(-24 * (day - 1));
        date.setHours(0);
        date.setMinutes(0);
        return date;
    }

    /**
     * Calcualte time of checks
     * @param {*} checks List of checks to count
     * @param {*} project Limit to only one project ID
     */
    calcualte_time(checks, project = undefined) {
        var checked_in = false;
        var checked_in_date = false;
        var checked_in_project = false;

        var time = 0;
        for (var check of checks) {
            if (check.check_in && !checked_in) {
                checked_in = true;
                checked_in_date = new Date(check.date);
                checked_in_project = check.project;
            } else if (!check.check_in) {
                if (checked_in) {
                    if (project === undefined || checked_in_project == project)
                        time +=
                            new Date(check.date).getTime() -
                            checked_in_date.getTime();

                    checked_in = false;
                    checked_in_date = false;
                    checked_in_project = false;
                }
            }
        }
        return time;
    }
}

module.exports = User;
