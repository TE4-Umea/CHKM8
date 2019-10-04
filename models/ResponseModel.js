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
        this.res = res;
    }
    /**
     * This is a abstarction layer function to render a sucess json response.
     *
     * @param {Response} res
     * @param {String=} message text message
     * @param {object=} params optional
     */
    async success_response(message = '', params = {}) {
        this.json(this.JRES.SuccessResponse(message, params));
    }

    /**
     * This is a abstarction layer function to render a error json response.
     *
     * @param {Response} res
     * @param {String=} message text message
     * @param {object=} params optional
     */
    async error_response(message = '', params = {}) {
        this.json(this.JRES.SuccessResponse(message, params));
    }

    /**
     * This sends a Json response
     */
    async json(params) {
        this.res.json(params);
    }
}

module.exports = ResponseModel;
