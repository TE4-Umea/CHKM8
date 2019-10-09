class UserController {
    constructor() {
        this.Payload = require('../../models/PayloadModel');
        this.Response = require('../../models/ResponseModel');
        this.User = new (require('../../User'))();
    }

    /**
     * POST api/user
     * Get client profile from token
     * @param {*} req
     * @param {*} res
     */
    async index(req, res) {
        var payload = new this.Payload(req);
        // Loads ResponseModel
        var response = new this.Response(res);
        var user = await this.User.get_from_token(payload.token);

        if (user) {
            var data = await this.User.get_data(user.id);
            response.success_response('success', { profile: data });
        } else {
            response.error_response('Invalid token');
        }
    }

    /**
     * Creates a new account.
     * @param {Request} req HTTP request
     * @param {Response} res HTTP response
     */
    async store(req, res) {
        //TODO Refractor this function to be less of a mess.
        /** Get attributes from request */
        var payload = new this.Payload(req);
        // Loads ResponseModel
        var response = new this.Response(res);

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

        var user = await this.User.create(
            payload.username,
            payload.password,
            payload.name
        );

        if (user) {
            var token = await this.User.generate_token(
                user.username
            );

            
            response.success_response('success', { token: token });
        }
    }

    /**
     * POST /api/user,
     * Check if a username is taken and returns a json.
     * @param {*} req
     * @param {*} res
     */
    async show(req, res) {
        /** Get attributes from request */
        var payload = new this.Payload(req);
        // Loads ResponseModel
        var response = new this.Response(res);

        if (payload.username) {
            var user = await this.User.get_from_username(payload.username);
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
    async update(req, res) {
        var payload = new this.Payload(req);
        var response = new this.Response(res);
        var sign;
        var https = require('https');

        var config = new (require('../../ConfigLoader'))().load();
        var db = new (require('../../Database'))(config);
        /* Send a request to slack to get user information from the login */
        https.get(
            `https://slack.com/api/oauth.access?client_id=${config.client_id}&client_secret=${config.client_secret}&code=${payload.sign_token}`,
            resp => {
                var data = '';
                resp.on('data', chunk => {
                    data += chunk;
                });

                resp.on('end', async () => {
                    /* Once the data has been downloaded, parse it into a JSON */
                    data = JSON.parse(data);
                    /* If the request and code was successfull */
                    if (data.ok) {
                        /* Check if the user is already signed up */
                        var slack_taken = await db.query_one(
                            'SELECT * FROM users WHERE slack_id = ?',
                            data.user.id
                        );
                        if (slack_taken) {
                            response.error_response(
                                'This slack account is already linked to another user. Please delete that account first or ask an administrator for help.'
                            );
                            return;
                        }
                        // Successfully got information from slack and this user is not already linked.
                        sign = {
                            access_token: data.access_token,
                            slack_domain: data.team.domain,
                            slack_id: data.user.id,
                            name: data.user.name,
                            avatar: data.user.image_512,
                            email: data.user.email,
                        };

                        var user = await this.User.get_from_token(
                            payload.token
                        );
                        if (user) {
                            // Fill users slack information
                            await db.query(
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
                        } else {
                            response.error_response('Invalid CHKM8 token');
                        }
                    } else {
                        response.error_response(data.error);
                        return;
                    }
                });
            }
        );
    }
}

module.exports = UserController;
