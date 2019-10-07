class JSONResponse {
    /**
     * A response
     * @param {String} text Message
     * @param {Object} params Optional parameters
     * @returns {JSONResponse} Statement
     */
    constructor(text, params = {}) {
        this.text = text;
        this.params = params;
        for (var key in this.params) {
            this[key] = this.params[key];
        }
        return this;
    }
}

class SuccessResponse extends JSONResponse {
    /**
     * A response ment to indicate success.
     * @param {String} text Success message.
     * @param {Object} params Optional parameters
     * @returns {SuccessResponse} success statement
     */
    constructor(text, params = {}) {
        super(text, params);
        this.success = true;
        return this;
    }
}

class ErrorResponse extends JSONResponse {
    /**
     * A response ment to indicate an error.
     * @param {String} text Error message.
     * @param {Object} params Optional parameters
     * @returns {ErrorResponse} error statement
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
