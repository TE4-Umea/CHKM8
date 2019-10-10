class PayloadModel {
    constructor(req) {
        for(var key in req.body) this[key] = req.body[key];
        for(key in req.query) this[key] = req.query[key];
        return this;
    }
}

module.exports = PayloadModel;
