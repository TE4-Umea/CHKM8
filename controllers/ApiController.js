/**
 * REST API for CHKM8
 */

class API {
    constructor(server) {
        this.JRES = require('../JSONResponse');
        this.PAYLOAD = require('../model/PayloadModel');
        this.RESPONSE = require('../model/ResponseModel');
        this.server = server;
    }

    /**
     * Check in or out a user
     * @param {*} req
     * @param {*} res
     */
    async checkin(req, res) {
        /** Get attributes from request */
        var payload = new this.PAYLOAD(req);
        // Loads ResponseModel
        var response = new this.RESPONSE(res);
        /** Get user safe from token */
        var user = await this.server.User.get_from_token(payload.token);
        if (user) {
            /** Check in the user */
            response.json(
                await this.server.Check.check_in(
                    user.id,
                    payload.check_in,
                    payload.project,
                    'api'
                )
            );
        } else {
            response.error_response('Invalid Token');
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
        var payload = new this.PAYLOAD(req);
        // Loads ResponseModel
        var response = new this.RESPONSE(res);
        /** Get the user safley from token */
        var user = await this.server.User.get_from_token(payload.token);
        /** Make sure user is loaded correctly */
        if (user) {
            /** Create the project via the user and project name and respond to the request with res */
            response.json(
                await this.server.Project.create(payload.project, user)
            );
        } else {
            response.error_response('Invalid Token');
        }
    }

    /**
     * Add user to project
     * @param {*} req
     * @param {*} res
     */
    async add(req, res) {
        /** Get attributes from request */
        var payload = new this.PAYLOAD(req);
        // Loads ResponseModel
        var response = new this.RESPONSE(res);
        /** Load user safe from token */
        var user = await this.server.User.get_from_token(payload.token);
        /** Load user that will be added */
        var user_to_add = await this.server.User.get_from_username(
            payload.username
        );

        var project = await this.server.Project.get(payload.project);
        /** Add the user to the project via the requesting user */
        /** Responde to the user */
        response.json(
            await this.server.Project.add_user(user_to_add, project.id, user)
        );
    }

    /**
     * Remove user from project
     * @param {*} req
     * @param {*} res
     */
    async remove(req, res) {
        /** Get attributes from request */
        var payload = new this.PAYLOAD(req);
        // Loads ResponseModel
        var response = new this.RESPONSE(res);
        var user_to_remove = await this.server.User.get_from_username(
            payload.username
        );
        var user = await this.server.User.get_from_token(payload.token);
        response.json(
            await this.server.remove_user_from_project(
                user_to_remove,
                payload.token,
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
        var payload = new this.PAYLOAD(req);
        // Loads ResponseModel
        var response = new this.RESPONSE(res);

        /** Read from server via attributes */
        var user = await this.server.User.get_from_token(payload.token);
        var project = await this.server.Project.get(payload.project);
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
                    response.success_response('sucess', {
                        project: project_data,
                    });
                } else {
                    response.error_response(
                        `You don't have access to this project`
                    );
                }
            }
        } else if (!user) {
            // If user does not exist, invalid token.
            response.error_response('Invalid token');
        } else if (!project) {
            // If project does not exist, then prject not found.
            response.error_response('Project not found');
        } else if (!project_data) {
            // If project data does not exist, then project data is corrupt.
            response.error_response('Project data corrupt');
        } else {
            response.error_response('Something went wrong.');
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
        // Loads ResponseModel
        var response = new this.RESPONSE(res);
        var user = await this.server.User.get_from_token(token);

        if (user) {
            var data = await this.server.User.get_data(user.id);
            response.success_response('success', { profile: data });
        } else {
            response.error_response('Invalid token');
        }
    }

    /**
     * POST api/login
     * Get client token from username and password
     * @param {*} req
     * @param {*} res
     */
    async login(req, res) {
        /** Get attributes from request */
        var payload = new this.PAYLOAD(req);
        // Loads ResponseModel
        var response = new this.RESPONSE(res);
        //TODO Fix this weird negative.
        if (!payload.username || !payload.password) {
            response.error_response('Missing parameters');
            return;
        }
        var user = await this.server.User.get_from_username(payload.username);

        // Sign in
        user = await this.server.User.get_from_username_and_password(
            payload.username,
            payload.password
        );
        if (user) {
            var token = await this.server.User.generate_token(user.username);
            if (token) {
                response.success_response('success', { token: token });
            }
        } else {
            response.error_response('Wrong username or password');
        }
    }

    /**
     * Creates a new account.
     * @param {Request} req HTTP request
     * @param {Response} res HTTP response
     */
    async signup(req, res) {
        /** Get attributes from request */
        var payload = new this.PAYLOAD(req);
        // Loads ResponseModel
        var response = new this.RESPONSE(res);

        if (!(payload.username && payload.password && payload.name)) {
            // A bunch of tenary statements to decide what params are missing.
            let message =
                'Missing parameters:' +
                (!payload.username ? ' username' : '') +
                (!payload.password ? ' password' : '') +
                (!payload.name ? ' name' : '');
            response.error_response(message);
            // If the username contains illegal characters.
        } else if (
            payload.username.replace(/[^a-z0-9_]+|\s+/gim, '') !==
            payload.username
        ) {
            response.error_response('Username contains illegal characters');
            // if the username is shorter than 3 characters.
        } else if (payload.username.length < 3) {
            response.error_response(
                'Username has to be at least three characters long'
            );
            // if username is longer than 20 characters.
        } else if (payload.username.length > 20) {
            response.error_response('Username cannot exceed 20 characters');
            // if no space in the name was present
        } else if (payload.name.indexOf(' ') == -1) {
            response.error_response(
                'Please provide a full name, ex. Michael Stevens'
            );
            // If no password was present
        } else if (payload.password == '') {
            response.error_response('Please enter a password.');
        }

        var return_val = await this.server.User.create(
            payload.username,
            payload.password,
            payload.name
        );
        if (return_val.success) {
            var token = await this.server.User.generate_token(
                return_val.user.username
            );
            response.success_response('success', { token: token });
        } else {
            response.success_response(return_val.text);
        }
    }

    /**
     * POST /api/user,
     * Check if a username is taken and returns a json.
     * @param {*} req
     * @param {*} res
     */
    async username_taken(req, res) {
        /** Get attributes from request */
        var payload = new this.PAYLOAD(req);
        // Loads ResponseModel
        var response = new this.RESPONSE(res);

        if (payload.username) {
            var user = await this.server.User.get_from_username(
                payload.username
            );
            if (user) {
                response.success_response('success', { taken: true });
            } else {
                response.success_response('success', { taken: false });
            }
        } else {
            response.error_response('Missing username attribute');
        }
    }

    /**
     * will sign a client to their slack account (link)
     * @param {Request} req
     * @param {Response} res
     */
    async sign(req, res) {
        /** Get attributes from request */
        var payload = new this.PAYLOAD(req);
        // Loads ResponseModel
        var response = new this.RESPONSE(res);

        for (var sign of this.server.slack_sign_users) {
            if (sign.token === payload.sign_token) {
                var user = await this.server.User.get_from_token(payload.token);
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
                    response.success_response('success', {
                        redir: '/dashboard',
                    });
                }
            }
        }
    }
}

module.exports = API;
