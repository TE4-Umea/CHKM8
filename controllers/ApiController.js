/**
 * REST API for CHKM8
 */

class API {
    
    constructor(server) {
        this.JRES = require('../JSONResponse');
        this.PAYLOAD = require('../model/Payload');
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
        /** Get user safe from token */
        var user = await this.server.User.get_from_token(payload.token);
        if (user) {
            /** Check in the user */
            res.json(
                await this.server.Check.check_in(
                    user.id,
                    payload.check_in,
                    payload.project,
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
        var payload = new this.PAYLOAD(req);
        /** Get the user safley from token */
        var user = await this.server.User.get_from_token(payload.token);
        /** Make sure user is loaded correctly */
        if (user) {
            /** Create the project via the user and project name and respond to the request with res */
            res.json(await this.server.Project.create(payload.project, user));
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
        var payload = new this.PAYLOAD(req);
        /** Load user safe from token */
        var user = await this.server.User.get_from_token(payload.token);
        /** Load user that will be added */
        var user_to_add = await this.server.User.get_from_username(payload.username);

        var project = await this.server.Project.get(payload.project);
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
        /** Get attributes from request */
        var payload = new this.PAYLOAD(req);
        
        var user_to_remove = await this.server.User.get_from_username(payload.username);
        var user = await this.server.User.get_from_token(payload.token);
        res.json(
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
            this.success_response(res,'success', {profile: data})
        } else {
            this.error_response(res, 'Invalid token');
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
        if (!payload.username || !payload.password) {
            res.json({
                success: false,
                text: 'Missing parameters',
            });
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
        /** Get attributes from request */
        var payload = new this.PAYLOAD(req);
        if (!(payload.username && payload.password && payload.name)) {
            // A bunch of tenary statements to decide what params are missing.
            let message =
                'Missing parameters:' +
                (!payload.username ? ' username' : '') +
                (!payload.password ? ' password' : '') +
                (!payload.name ? ' name' : '');
            this.error_response(res, message);
            // If the username contains illegal characters.
        } else if (payload.username.replace(/[^a-z0-9_]+|\s+/gim, '') !== payload.username) {
            this.error_response(res, 'Username contains illegal characters');
            // if the username is shorter than 3 characters.
        } else if (payload.username.length < 3) {
            this.error_response(
                res,
                'Username has to be at least three characters long'
            );
            // if username is longer than 20 characters.
        } else if (payload.username.length > 20) {
            this.error_response(res, 'Username cannot exceed 20 characters');
            // if no space in the name was present
        } else if (payload.name.indexOf(' ') == -1) {
            this.error_response(
                res,
                'Please provide a full name, ex. Michael Stevens'
            );
            // If no password was present
        } else if (payload.password == '') {
            this.error_response(res, 'Please enter a password.');
        }

        var response = await this.server.User.create(payload.username, payload.password, payload.name);
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
        /** Get attributes from request */
        var payload = new this.PAYLOAD(req);
        if (payload.username) {
            var user = await this.server.User.get_from_username(payload.username);
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
     * will sign a client to their slack account (link)
     * @param {Request} req
     * @param {Response} res
     */
    async sign(req, res) {
        /** Get attributes from request */
        var payload = new this.PAYLOAD(req);

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
                    this.success_response(res, 'success', {
                        redir: '/dashboard',
                    });
                }
            }
        }
    }
}

module.exports = API;
