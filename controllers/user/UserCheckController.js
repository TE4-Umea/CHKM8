class UserCheckController {
    constructor() {
        this.Payload = require('../../models/PayloadModel');
        this.Response = require('../../models/ResponseModel');
        this.User = new (require('../../User'))();
    }

    /**
     * Check in or out a user
     * @param {*} req
     * @param {*} res
     */
    async store(req, res) {
        /** Get attributes from request */
        var payload = new this.Payload(req);
        // Loads ResponseModel
        var response = new this.Response(res);
        /** Get user safe from token */
        var user = await this.User.get_from_token(payload.token);
        if (user) {
            var Check = new (require('../../Check'))();

            /** Check in the user */
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