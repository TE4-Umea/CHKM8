class UserCheckController {
    constructor() {
        this.Payload = require('../../models/PayloadModel');
        this.Response = require('../../models/ResponseModel');
        this.User = new (require('../../User'))();
    }

    /**
     * Get request returns a json repsonse containing all checks associated with with a user specified by its token
     * or if the token is by a admin it will return all specified users in the optional parameter users.
     * @param {Reqeust} req express request
     * @param {Response} res express response
     * @returns Returns a json of data.
     */
    show(req, res) {
        // Get attributes from request
        var payload = new this.Payload(req);
        // Loads ResponseModel
        var response = new this.Response(res);
        var user = await this.User.get_from_token(payload.token);


        
    }

    /**
     * Check in or out a user
     * @param {*} req
     * @param {*} res
     */
    async store(req, res) {
        // Get attributes from request
        var payload = new this.Payload(req);
        // Loads ResponseModel
        var response = new this.Response(res);
        // Get user safe from token
        var user = await this.User.get_from_token(payload.token);
        if (user) {
            var Check = new (require('../../Check'))();

            // Check in the user
            response.json(
                await Check.check_in(
                    user.id,
                    payload.check_in,
                    payload.project,
                    0
                )
            );
        } else {
            response.error_response('Invalid Token');
        }
    }
}

module.exports = UserCheckController;