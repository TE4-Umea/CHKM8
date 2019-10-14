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
    async show(req, res) {
        // Get attributes from request
        var payload = new this.Payload(req);
        // Loads ResponseModel
        var response = new this.Response(res);
        // Get user safe from token
        var user = await this.User.get_from_token(payload.token);
        var data = [];
        var start_date = this.get_start_date(payload);
        var end_date = this.get_end_date(payload);
        if(!user){
            response.error_response('Invalid token');
            return;
        }else if (
            user.admin &&
            (Array.isArray(payload.ids) && payload.ids.length > 0)
        ) {
            for (var id of payload.ids){
                var checks = await this.fetch_checks(id, start_date, end_date);
                console.log('test', id);
                data.push(...checks);
            }
        } else {
            data.push(...await this.fetch_checks(user.id, start_date, end_date));
        }
        response.success_response('Succesfully fetched checks', { checks: data });
    }

    /**
     * Gets the start date if it exists else it generates a one.
     *
     * @param {PayloadModel} payload payload model possibly containg start date.
     * @returns {Int} returns a int timestamp of the start_date
     */
    get_start_date(payload) {
        if (!payload.start_date) {
            var d = new Date();
            d.setHours(24, 0, 0, 0);
            d.setDate(d.getDate() - 5);
            return d / 1000;
        } else {
            return payload.start_date / 1000;
        }
    }

    /**
     * Gets the end date if it exists else it generates a one.
     *
     * @param {PayloadModel} payload
     * @returns {Int} returns a int timestamp of the end_date
     */
    get_end_date(payload) {
        if (!payload.end_date) {
            var d = new Date();
            d.setHours(24, 0, 0, 0);
            return d / 1000;
        } else {
            return payload.end_date / 1000;
        }
    }

    /**
     * Returns the checks associated with a specified user between two timestamps
     *
     * @param {Int} user_id
     * @param {Int} start_date
     * @param {Int} end_date
     * @returns {Array} Checks
     */
    async fetch_checks(user_id, start_date, end_date) {
        var config = new (require('../../ConfigLoader'))().load();
        var check_types = new (require('../../models/CheckTypes'))();
        var db = new (require('../../Database'))(config);
        var res = await db.query(
            'SELECT * FROM `checks` WHERE `user` = ? AND ' +
                '`date` BETWEEN FROM_UNIXTIME(?) AND FROM_UNIXTIME(?) ' +
                'ORDER BY `id`',
            [user_id, start_date, end_date]
        );
        for (var index of res) {
            index.type = check_types.get_name(index.type);
        }
        return res;
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
            payload.check_in = this.parse_bool(payload.check_in);
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

    /**
     * Parses a string to a boolean value.
     * 
     * @param {string} check 
     */
    parse_bool(check) {
        if (['1', true, 'true', 'True'].indexOf(check) > -1)
            return true;
        return false;
    }   
}

module.exports = UserCheckController;
