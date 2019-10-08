/**
 * A response containing a status message, success status and optional properties.
 * @typedef {Object} JSONResponse
 * @property {String} text yeet
 */

class JSONResponse {
    /**
     * A response
     * 
     * @param {Object} params Optional parameters
     * @param {Boolean} success true on success, false on error.
     * @returns {JSONResponse} Statement
     */
    constructor(text, success, params = {}) {
        this.text = 'test';//text;
        this.success = success;
        for (var key in params) {
            this[key] = params[key];
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
        super(text, true, params);
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
        super(text, false, params);
    }
}

module.exports = {
    JSONResponse,
    SuccessResponse,
    ErrorResponse,
};
