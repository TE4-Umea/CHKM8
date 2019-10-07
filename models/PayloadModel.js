class PayloadModel {
    constructor(req) {
        this.token = req.body.token;
        this.check_in = req.body.check_in;
        this.project = req.body.project ? req.body.project : null;
        this.username = req.body.username;
        this.password = req.body.password;
        this.name = req.body.name;
        this.sign_token = req.body.sign_token;

    }
}

module.exports = PayloadModel;