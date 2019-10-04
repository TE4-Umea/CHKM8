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
            res.json(await this.server.Check.check_in(
                user.id,
                check_in,
                project,
                'api'
            ));
        } else {
            res.json(this.JRES.ErrorResponse('Invalid Token'));
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
            res.json(this.JRES.ErrorResponse('Invalid Token'));
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
        res.json(await this.server.Project.add_user(
            user_to_add,
            project.id,
            user
        ));
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

        res.json(await this.server.remove_user_from_project(
            user_to_remove,
            project,
            user
        ));
    }

    /**
     * POST /api/project
     * Get information of a project and all the members
     * @param {*} req
     * @param {*} res
     */
    async project(req, res) {
        /** Get attributes from request */
        var project_name = req.body.project;
        var token = req.body.token;
        /** Read from server via attributes */
        var user = await this.server.User.get_from_token(token);
        var project = await this.server.Project.get(project_name);
        var project_data = await this.server.Project.get_data(project.id);

        /** Make sure user exists */
        if (user) {
            /** Make sure project exists */
            if (project) {
                /** Make sure the user has access to the project (owner or jointed) */
                var has_access = await this.server.Project.is_joined(
                    user.id,
                    project.id
                );
                /** Make sure data has been collected right */
                if (project_data) {
                    if (has_access) {
                        res.json({
                            success: true,
                            project: project_data,
                        });
                    } else {
                        res.json({
                            success: false,
                            text: "You don't have access to this project",
                        });
                    }
                } else {
                    res.json({
                        success: false,
                        text: 'Project data corrupt',
                    });
                }
            } else {
                res.json({
                    success: false,
                    text: 'Project not found',
                });
            }
        } else {
            res.json({
                success: false,
                text: 'Invalid token',
            });
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
                res.json({
                    success: true,
                    token: token,
                });
            }
        } else {
            res.json({
                success: false,
                text: 'Wrong username or password',
            });
        }
    }

    /**
     * Create an account
     * @param {*} req HTTP request
     * @param {*} res HTTP response
     */
    async signup(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var name = req.body.name;

        if (!(username && password && name)) {
            res.json({
                success: false,
                text:
                    'Missing parameters:' +
                    (!username ? ' username' : '') +
                    (!password ? ' password' : '') +
                    (!name ? ' name' : ''),
            });
            return;
        }

        // Sign up
        if (username.replace(/[^a-z0-9_]+|\s+/gim, '') !== username) {
            res.json({
                success: false,
                text: 'Username contains illigal characters',
            });
            return;
        }
        if (username.length < 3) {
            res.json({
                success: false,
                text: 'Username has to be at least three characters long',
            });
            return;
        }
        if (username.length > 20) {
            res.json({
                success: false,
                text: 'Username cannot exceed 20 characters',
            });
            return;
        }
        if (name.indexOf(' ') == -1) {
            res.json({
                success: false,
                text: 'Please provide a full name, ex. Michael Stevens',
            });
            return;
        }
        if (password == '') {
            res.json({
                success: false,
                text: 'Please enter a password',
            });
            return;
        }
        var response = await this.server.User.create(username, password, name);
        if (response.success) {
            var token = await this.server.User.generate_token(
                response.user.username
            );
            res.json({
                success: true,
                token: token,
            });
        } else {
            res.json({
                success: false,
                text: response.text,
            });
        }
    }

    /**
     * POST /api/user
     * Check if a username is taken
     * @param {*} req
     * @param {*} res
     */
    async username_taken(req, res) {
        var username = req.body.username;
        if (!username) {
            res.json({
                success: false,
                text: 'Missing username attribute',
            });
            return;
        }
        var user = await this.server.User.get_from_username(username);
        if (user) {
            res.json({
                success: true,
                taken: true,
            });
        } else {
            res.json({
                success: true,
                taken: false,
            });
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
}

module.exports = API;
