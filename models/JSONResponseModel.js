class JSONResponse {
    /**
     * 
     * @param {String} text 
     * @param {Object} params 
     * @returns {JSONResponse}
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
     * Return a success statement
     * @param {String} text Success message.
     * @param {Object} params Optional parameters
     * @returns {SuccessResponse}
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
     * @returns {ErrorResponse} 
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
