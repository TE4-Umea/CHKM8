class JSONResponse {
    constructor(text, params = {}) {
        this.text = text;
        for (var key in params) {
            this[key] = params[key];
        }
        return this;
    }
}

class SuccessResponse extends JSONResponse {
    /**
     * Return a success statement
     * @param {String} text Success message.
     * @param {Object} params Optional parameters
     */
    constructor(text, params = {}) {
        super(text, params);
        this.success = true;
        return this;
    }
}

class ErrorResponse extends JSONResponse {
    /**
     * Return a success statement
     * @param {String} text Error message.
     * @param {Object} params Optional parameters
     */
    constructor(text, params = {}) {
        super(text, params);
        this.success = false;
        return this;
    }
}

module.exports = {
    JSONResponse,
    SuccessResponse,
    ErrorResponse,
};
