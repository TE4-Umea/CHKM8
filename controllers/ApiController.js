/**
 * REST API for CHKM8
 */

class API {
    constructor(server) {
        this.JRES = require('../JSONResponse');
        this.server = server;
    }

    /**
     * Check in or out a user
     * @param {*} req
     * @param {*} res
     */
    async checkin(req, res) {
        /** Get attributes from request */
        var token = req.body.token;
        var check_in = req.body.check_in;
        /** Get project name from request, if it doesn't exist, make it null. */
        var project = req.body.project ? req.body.project : null;
        /** Get user safe from token */
        var user = await this.server.User.get_from_token(token);
        if (user) {
            /** Check in the user */
            res.json(
                await this.server.Check.check_in(
                    user.id,
                    check_in,
                    project,
                    'api'
                )
            );
        } else {
            this.error_response(res, 'Invalid Token');
        }
    }

    /**
     * Create a new project
     * REQ: {token, project}
     * @param {*} req
     * @param {*} res
     */
    async new_project(req, res) {
        /** Get attributes from request */
        var token = req.body.token;
        var project_name = req.body.project;

        /** Get the user safley from token */
        var user = await this.server.User.get_from_token(token);
        /** Make sure user is loaded correctly */
        if (user) {
            /** Create the project via the user and project name and respond to the request with res */
            res.json(await this.server.Project.create(project_name, user));
        } else {
            this.error_response(res, 'Invalid Token');
        }
    }

    /**
     * Add user to project
     * @param {*} req
     * @param {*} res
     */
    async add(req, res) {
        /** Get attributes from request */
        var project_name = req.body.project;
        var token = req.body.token;
        var username = req.body.username;

        /** Load user safe from token */
        var user = await this.server.User.get_from_token(token);
        /** Load user that will be added */
        var user_to_add = await this.server.User.get_from_username(username);

        var project = await this.server.Project.get(project_name);
        /** Add the user to the project via the requesting user */
        /** Responde to the user */
        res.json(
            await this.server.Project.add_user(user_to_add, project.id, user)
        );
    }

    /**
     * Remove user from project
     * @param {*} req
     * @param {*} res
     */
    async remove(req, res) {
        var username = req.body.username;
        var token = req.body.token;
        var project = req.body.project;

        var user_to_remove = await this.server.User.get_from_username(username);
        var user = await this.server.User.get_from_token(token);
        res.json(
            await this.server.remove_user_from_project(
                user_to_remove,
                project,
                user
            )
        );
    }

    /**
     * POST /api/project. Returns a json with the status of a given project.
     * Get information of a project and all the members
     * @param {Request} req
     * @param {Response} res
     */
    async project(req, res) {
        /** Get attributes from request */
        var project_name = req.body.project;
        var token = req.body.token;
        /** Read from server via attributes */
        var user = await this.server.User.get_from_token(token);
        var project = await this.server.Project.get(project_name);
        var project_data = await this.server.Project.get_data(project.id);
        /** Make sure user and project exists */
        if (user && project) {
            var has_access = await this.server.Project.is_joined(
                user.id,
                project.id
            );
            // Make sure the project data exists.
            if (project_data) {
                if (has_access) {
                    this.success_response(res, 'sucess', {
                        project: project_data,
                    });
                } else {
                    this.error_response(
                        res,
                        `You don't have access to this project`
                    );
                }
            }
        } else if (!user) {
            // If user does not exist, invalid token.
            this.error_response(res, 'Invalid token');
        } else if (!project) {
            // If project does not exist, then prject not found.
            this.error_response(res, 'Project not found');
        } else if (!project_data) {
            // If project data does not exist, then project data is corrupt.
            this.error_response(res, 'Project data corrupt');
        } else {
            this.error_response(res, 'Something went wrong.');
        }
    }

    /**
     * POST api/profile
     * Get client profile from token
     * @param {*} req
     * @param {*} res
     */
    async profile(req, res) {
        var token = req.body.token;
        var user = await this.server.User.get_from_token(token);
        if (user) {
            var data = await this.server.User.get_data(user.id);
            this.su;
            res.json({
                success: true,
                profile: data,
            });
        } else {
            res.json({
                success: false,
                text: 'Invalid token',
            });
        }
    }

    /**
     * POST api/login
     * Get client token from username and password
     * @param {*} req
     * @param {*} res
     */
    async login(req, res) {
        var username = req.body.username;
        var password = req.body.password;

        if (!username || !password) {
            res.json({
                success: false,
                text: 'Missing parameters',
            });
            return;
        }
        var user = await this.server.User.get_from_username(username);

        // Sign in
        user = await this.server.User.get_from_username_and_password(
            username,
            password
        );
        if (user) {
            var token = await this.server.User.generate_token(user.username);
            if (token) {
                this.success_response(res, 'success', { token: token });
            }
        } else {
            this.error_response(res, 'Wrong username or password');
        }
    }

    /**
     * Creates a new account.
     * @param {Request} req HTTP request
     * @param {Response} res HTTP response
     */
    async signup(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var name = req.body.name;

        if (!(username && password && name)) {
            // A bunch of tenary statements to decide what params are missing.
            let message =
                'Missing parameters:' +
                (!username ? ' username' : '') +
                (!password ? ' password' : '') +
                (!name ? ' name' : '');
            this.error_response(res, message);
            // If the username contains illegal characters.
        } else if (username.replace(/[^a-z0-9_]+|\s+/gim, '') !== username) {
            this.error_response(res, 'Username contains illegal characters');
            // if the username is shorter than 3 characters.
        } else if (username.length < 3) {
            this.error_response(
                res,
                'Username has to be at least three characters long'
            );
            // if username is longer than 20 characters.
        } else if (username.length > 20) {
            this.error_response(res, 'Username cannot exceed 20 characters');
            // if no space in the name was present
        } else if (name.indexOf(' ') == -1) {
            this.error_response(
                res,
                'Please provide a full name, ex. Michael Stevens'
            );
            // If no password was present
        } else if (password == '') {
            this.error_response(res, 'Please enter a password.');
        }

        var response = await this.server.User.create(username, password, name);
        if (response.success) {
            var token = await this.server.User.generate_token(
                response.user.username
            );
            this.success_response(res, 'success', { token: token });
        } else {
            this.success_response(res, response.text);
        }
    }

    /**
     * POST /api/user,
     * Check if a username is taken and returns a json.
     * @param {*} req
     * @param {*} res
     */
    async username_taken(req, res) {
        var username = req.body.username;
        if (username) {
            var user = await this.server.User.get_from_username(username);
            if (user) {
                this.success_response(res, 'success', { taken: true });
            } else {
                this.success_response(res, 'success', { taken: false });
            }
        } else {
            this.error_response(res, 'Missing username attribute');
        }
    }

    /**
     * Sign a client to thier slack account (link)
     * @param {*} req
     * @param {*} res
     */
    async sign(req, res) {
        var token = req.body.token;
        var sign_token = req.body.sign_token;

        for (var sign of this.server.slack_sign_users) {
            if (sign.token === sign_token) {
                var user = await this.server.User.get_from_token(token);
                if (user) {
                    // Fill users slack information
                    await this.server.db.query(
                        'UPDATE users SET email = ?, slack_id = ?, slack_domain = ?, access_token = ?, avatar = ?, name = ? WHERE id = ?',
                        [
                            sign.email,
                            sign.slack_id,
                            sign.slack_domain,
                            sign.access_token,
                            sign.avatar,
                            sign.name,
                            user.id,
                        ]
                    );
                    res.json({
                        success: true,
                        redir: '/dashboard',
                    });
                }
            }
        }
    }

    /**
     * This is a abstarction layer function to render a sucess json response.
     *
     * @param {Response} res
     * @param {String=} message text message
     * @param {object=} params optional
     */
    async success_response(res, message = '', params = {}) {
        res.json(res, this.JRES.SuccessResponse(message, params));
    }

    /**
     * This is a abstarction layer function to render a error json response.
     *
     * @param {Response} res
     * @param {String=} message text message
     * @param {object=} params optional
     */
    async error_response(res, message = '', params = {}) {
        res.json(res, this.JRES.SuccessResponse(message, params));
    }
}

module.exports = API;
