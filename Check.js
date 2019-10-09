class Check {
    constructor() {
        this.config = new (require('./ConfigLoader'))().load();
        // Database async handler
        // Setup db handler with config
        this.db = new (require('./Database'))(this.config);

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
        var User = new (require('./User'))();
        // Get user from ID
        var user = await User.get(user_id);

        if (user) {
            // Get the users last check
            var last_check = await this.get_last_check(user.id);

            // Calcualte time between last check and now
            var time_of_checkout = Date.now() - last_check.date;

            if (project_id) {
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
            if (!project_id) project_id = null;
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
     */
    async is_checked_in(user_id) {
        // Get last check and return if it was a check_in or check_out, aka if the user is currently checked in.
        var checked_in = await this.get_last_check(user_id);
        return checked_in.check_in;
    }

    /**
     * Get the last check from a user
     * If the user has never checked in before, it will look like a "check out" so
     * it should behave the same for new users.
     * @param {Int} user_id
     */
    async get_last_check(user_id) {
        // Get the last check from the database
        var last_check_in = await this.db.query_one(
            'SELECT * FROM checks WHERE user = ? ORDER BY id DESC LIMIT 1',
            user_id
        );
        if (!last_check_in)
            return {
                // If the check doesnt exist, return a fake one so other functions can handle every case the same.
                check_in: false,
                project: '',
            };
        return last_check_in;
    }

    /**
     * Check in or out a user, with or without a project.
     * A user can check in again if they are already checked in but would like to switch
     * project. They will automatically be checked out and then in again in this function.
     *
     * @param {Int} user_id ID of the user being checked in or out
     * @param {Boolean} check_in Force check_in or check_out (default: undefined, toggle-check-in)
     * @param {String} project_name Name of the project (optional)
     * @param {String} type Type of check in (web, slack, terminal, card)
     * @returns Success, if the check in/out was successfull
     */
    async check_in(user_id, check_in = null, project_name = null, type = 0) {
        var Project = new (require('./Project'))();
        var user = await this.check_user_input(user_id);

        // Check if user is defined, if so get last check
        if (user) {
            var last_check = await this.get_last_check(user.id);
        } else {
            return new this.ErrorResponse('User not found.');
        }

        var project = await this.check_project_input(project_name);

        // Check if the project is definined, if so it's an existing project
        if (project) {
            /** Check if the user is a part of the project */
            var owns_project = await Project.is_joined(user.id, project.id);
            if (!owns_project)
                return new this.ErrorResponse(
                    'User is not a part of this project.'
                );
        } else {
            project = { id: null };
        }

        // Allow toggle check ins if force checkin is not specified
        if (check_in === null) check_in = !last_check.check_in;
        
        // If users last check was a check in, this will check them out before checking them in.
        if (
            check_in === true &&
            last_check.check_in &&
            project.id !== last_check.project
        ) {
            await this.check_in(user_id, false, null, type);
        }

        // Check IN the user
        if (
            check_in === true &&
            last_check.check_in &&
            last_check.project === project_name
        ) {
            // Check if this is a redundant check in (same project and already checked in)
            return new this.SuccessResponse(
                'You are already checked in' +
                    (project_name ? ' project: ' + project_name : '')
            );
        }

        // Check OUT the user
        if (check_in === false && last_check.check_in) {
            // Insert checkout
            await this.insert_check(user.id, false, null, type);
            return new this.SuccessResponse(
                'You are now checked out' + 
                (project_name ? ' from: ' + project_name : ''),
                {
                    checked_in: false,
                }
            );
        } else if (check_in === false && !last_check.check_in) {
            return new this.SuccessResponse('You are already checked out.', {
                checked_in: false,
            });
        }
        
        await this.insert_check(user.id, true, project.id, type);
        return new this.SuccessResponse(
            'You are now checked in ' +
                (project_name ? ' project: ' + project_name : ''),
            { checked_in: true }
        );
    }

    /**
     * Check user_id input in Check_in function
     * Return User if defined, else return Error message
     * @param {INT} user_id
     * @returns User if found
     */
    async check_user_input(user_id) {
        var User = new (require('./User'))(this);
        var user = await User.get(user_id);

        if (user) {
            // Get the last check from the user (to determine if they are currently checked in, how much time and what project.)
            return user;
        } else {
            return new this.ErrorResponse('User not found.');
        }
    }

    /**
     * If project is defined, load from DB and return it
     * If not found, project set to null
     * @param {String} project_name
     * @returns Project if found
     */
    async check_project_input(project_name) {
        var Project = new (require('./Project'))(this);
        /** Check if a project was admitted */
        if (
            project_name != null &&
            project_name != '' &&
            project_name != undefined
        ) {
            /** If project is admitted, load it from the DB */
            var project = await Project.get_from_name(project_name);
            return project;
        } else {
            //No project admitted
            project = null;
        }
    }
}
module.exports = Check;
