class PayloadModel {
    constructor(req) {
        for(var key in req.body) this[key] = req.body[key].split(',');
        for(key in req.query) this[key] = req.query[key].split(',');
        return this;
    }
}

module.exports = PayloadModel;