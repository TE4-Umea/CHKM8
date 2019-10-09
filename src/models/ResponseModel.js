/**
 * A ReponseModel for sending returns Json to Requests.
 */
class ResponseModel {
    /**
     * Constructor for creating the ResponseModel object.
     * Saves the Response object so it does not need to be called later.
     * @param {Response} res
     */
    constructor(res) {
        this._res = res;
        // JSONResponse is the standard response system for CHKM8
        this._JSONResponse = require('./JSONResponseModel');
        /* this.JSONResponse = new this.JSONResponse() */
        this._SuccessResponse = this._JSONResponse.SuccessResponse;
        this._ErrorResponse = this._JSONResponse.ErrorResponse;
    }
    /**
     * This is a abstarction layer function to render a sucess json response.
     *
     * @param {Response} res
     * @param {String=} message text message
     * @param {object=} params optional
     */
    async success_response(message = '', params = {}) {
        this.json(new this._SuccessResponse(message, params));
    }

    /**
     * This is a abstarction layer function to render a error json response.
     *
     * @param {Response} res
     * @param {String=} message text message
     * @param {object=} params optional
     */
    async error_response(message = '', params = {}) {
        this.json(new this._ErrorResponse(message, params));
    }

    /**
     * This sends a Json response
     */
    async json(params) {
        this._res.json(params);
    }
}

module.exports = ResponseModel;
