class Check {
    constructor() {
        this.config = new (require('./ConfigLoader'))().load();
        // Database async handler
        // Setup db handler with config
        this.db = new (require('./Database'))(this.config);

        // Require the User class

        // JSONResponse is the standard response system for CHKM8
        this.JSONResponse = require('./models/JSONResponseModel');
        // this.JSONResponse = new this.JSONResponse()
        this.SuccessResponse = this.JSONResponse.SuccessResponse;
        this.ErrorResponse = this.JSONResponse.ErrorResponse;
    }

    /**
     * Insert a check into the database.
     * A check is either a check in or check out.sudo
     * It also saves time, project and method of checking
     * @param {Int} user_id ID of the user to be checked in or out
     * @param {Boolean} check_in If the check is in or out
     * @param {Int} project_id Project name (optional)
     * @param {Int} type Method of checking (web, card, slack, terminal)
     */
    async insert_check(user_id, check_in, project_id = null, type) {
        var Project = new (require('./Project'))();
        var User = new (require('./User'))();
        // Get user from ID
        var user = await User.get(user_id);

        if (user) {
            // Get the users last check
            var last_check = await this.get_last_check_from_user(user.id);

            // Calcualte time between last check and now
            var time_of_checkout = Date.now() - last_check.date;

            /** If the user is checking out and their last check was in a project (aka currently checked into a project)
             *  We need to add their time_of_checkout to their work time on the project.
             */
            if (!check_in && last_check.project != null) {
                // Get the project info
                var project = await Project.get(last_check.project);
                project_id = project.id;
            }

            if (project) {
                // Make sure the project exists and then get the joint to make sure they are a part of the project
                var joint = await this.db.query_one(
                    'SELECT * FROM joints WHERE user = ? AND project = ?',
                    [user_id, project_id]
                );
            }

            if (joint) {
                // Add time worked on to the joint
                await this.db.query('UPDATE joints SET work = ? WHERE id = ?', [
                    time_of_checkout + joint.work,
                    joint.id,
                ]);
            }

            // Clear project if it's not admitted
            if (!check_in) project_id = null;
            if (!project) project_id = null;
            // Insert check into the database

            await this.db.query(
                'INSERT INTO checks (user, check_in, project, type) VALUES (?, ?, ?, ?)',
                [user_id, check_in, project_id, type]
            );

            return check_in;
        }
    }

    /**
     * Check if a user is checked in
     * @param {Int} user_id ID of the user
     * @returns {Boolean}
     */
    async is_checked_in(user_id) {
        // Get last check and return if it was a check_in or check_out, aka if the user is currently checked in.
        var checked_in = await this.get_last_check_from_user(user_id);
        //console.log('ye' + checked_in.check_in);
        return checked_in.check_in;
    }

    /**
     * Get the last check from a user
     * If the user has never checked in before, it will look like a "check out" so
     * it should behave the same for new users.
     * @param {Int} user_id
     * @returns {Object}
     */
    async get_last_check_from_user(user_id) {
        // Get the last check from the database
        var last_check = await this.db.query_one(
            'SELECT * FROM checks WHERE user = ? ORDER BY id DESC LIMIT 1',
            user_id
        );
        if (!last_check)
            return {
                // If the check doesnt exist, return a fake one so other functions can handle every case the same.
                check_in: false,
                project: '',
            };
        last_check.date = new Date(last_check.date);

        //console.log(last_check);
        return last_check;
    }

    /**
     * Check in or out a user, with or without a project.
     * A user can check in again if they are already checked in but would like to switch
     * project. They will automatically be checked out and then in again in this function.
     *
     * @param {Int} user_id ID of the user being checked in or out
     * @param {Boolean} check_in Force check_in or check_out (default: undefined, toggle-check-in)
     * @param {String} project_name Name of the project (optional)
     * @param {String} origin Type of check in (web, slack, terminal, card)
     * @returns Success, if the check in/out was successfull
     */
    async check_in(
        user_id,
        check_in = true,
        project_name = null,
        origin = null
    ) {
        var check_request = new CheckRequest(
            user_id,
            check_in,
            project_name,
            origin
        );

        var Project = new (require('./Project'))();

        var project_id;

        // Check if user is defined, if so get last check
        if (check_request.user_id) {
            check_request.current_user_check = await this.is_checked_in(
                check_request.user_id
            );
        } else {
            return new this.ErrorResponse('User not found.');
        }

        var project = await this.get_project_from_name(project_name);

        // Check if the project is definined, if so it's an existing project
        if (project) {
            project_id = project.id;
            // Check if the user is a part of the project
            var part_of_project = await Project.is_joined(user_id, project.id);
        } else {
            project = null;
        }

        if (project && part_of_project) {
            /** Otherwise, update the project name to make sure capitalisation is right.
             *  User has now been confirmed a part of the project requested
             */
            project_name = project.name;
            project_id = project.id;
        } else if (project && !part_of_project) {
            // If they are not part of the project, refuse the check
            return new this.ErrorResponse(
                'User is not a part of this project.'
            );
        }

        check_request.project_id = project_id;

        // Allow toggle check ins if force checkin is not specified
        if (check_in === null) {
            check_in = !check_request.current_user_check;
        } else if (check_in && check_request.current_user_check) {
            // If users last check was a check in, this will check them out before checking them in.
            this.insert_check(user_id, false, null, origin);
        }

        // Check if this is a redundant check in (same project and already checked in)
        var check_redundant = await this.is_check_redundant(check_request);
        if (check_redundant)
            return new this.ErrorResponse('You are already checked in.');

        // Check OUT the user
        if (
            check_request.getTypeValue(check_request.type) !=
            check_request.current_user_check
        ) {
            let insertResponse = await this.send_check(check_request);
            if (insertResponse)
                return new this.SuccessResponse(
                    'You are now checked in.' +
                        (check_request.project_name
                            ? ' Project: ' + check_request.project_name
                            : '')
                );
            else return new this.SuccessResponse(`You are now checked out`);
        } else if (check_request.type === 'check out')
            return new this.ErrorResponse('You are already checked out.');

        await this.send_check(check_request);
        return new this.SuccessResponse(
            'You are now checked in.' +
                (check_request.project_name
                    ? ' Project: ' + check_request.project_name
                    : '')
        );
    }

    /**
     * @param {CheckRequest} request 
     */
    async send_check(request) {
        var insertType = request.type == 'check in' ? true : false;

        // Insert checkout
        await this.insert_check(
            request.user_id,
            insertType,
            request.project_id,
            request.origin
        );

        return insertType;
    }

    /**
     * Checks if check_in is reduntant
     * @param {Datatype} request
     * @returns {Boolean} Is check reduntant?
     */
    async is_check_redundant(request) {
        var last_check = await this.get_last_check_from_user(request.user_id);

        //console.log(last_check);
        if (
            request.getTypeValue() === request.current_user_check &&
            last_check.project === request.project_name
        ) {
            return true;
        }
        return false;
    }

    /**
     * Check user_id input in Check_in function
     * Return User if defined, else return Error message
     * @param {Int} user_id
     * @returns {User} User if found
     */
    async get_user_from_db(user_id) {
        var UserClass = new (require('./User'))(this);
        var user = await UserClass.get(user_id);
        if (!user) return new this.ErrorResponse('User not found.');
        return user;
    }

    /**
     * If project is defined, load from DB and return it
     * If not found, project set to null
     * @param {String} project_name
     * @returns {Object} Project if found
     */
    async get_project_from_name(project_name) {
        // Check if a project was admitted
        var Project = new (require('./Project'))();
        if (
            project_name != null &&
            project_name != '' &&
            project_name != undefined
        ) {
            // If project is admitted, load it from the DB
            var project = await Project.get_from_name(project_name);
            return project;
        } else {
            //No project admitted
            project = null;
        }
    }
}
module.exports = Check;

class CheckRequest {
    constructor(user_id, check_in, project_name, origin) {
        this.user_id = user_id;
        this.type = check_in ? 'check in' : 'check out';
        this.project_name = project_name;
        this.origin = origin;

        return this;
    }

    /**
     * converts boolean to type.
     * @param {Boolean} check_in
     */
    setType(check_in) {
        this.type = check_in ? 'check in' : 'check out';
    }

    /**
     * Gets this.type as a boolean.
     */
    getTypeValue() {
        return this.type == 'check in' ? true : false;
    }
}
