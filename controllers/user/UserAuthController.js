class UserAuthController {
    
    constructor() {
        this.Payload = require('../../models/PayloadModel');
        this.Response = require('../../models/ResponseModel');
        this.User = new (require('../../User'))();
    }

    /**
     * POST api/login
     * Get client token from username and password
     * @param {*} req
     * @param {*} res
     */
    async store(req, res) {
        /** Get attributes from request */
        var payload = new this.Payload(req);
        // Loads ResponseModel
        var response = new this.Response(res);
        //TODO Fix this weird negative.
        if (!payload.username || !payload.password) {
            response.error_response('Missing parameters');
            return;
        }
        var user = await this.User.get_from_username(payload.username);

        // Sign in
        user = await this.User.get_from_username_and_password(
            payload.username,
            payload.password
        );

        if (user) {
            var token = await this.User.generate_token(user.username);
            if (token) {
                response.success_response('Successfully logged in!', {
                    token: token,
                });
            }
        } else {
            response.error_response('Wrong username or password');
        }
    }
}

module.exports = UserAuthController;