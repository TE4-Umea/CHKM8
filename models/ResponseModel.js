class ResponseModel {
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
        this.res.json(this.JRES.SuccessResponse(message, params));
    }

    /**
     * This is a abstarction layer function to render a error json response.
     *
     * @param {Response} res
     * @param {String=} message text message
     * @param {object=} params optional
     */
    async error_response(message = '', params = {}) {
        this.res.json(this.JRES.SuccessResponse(message, params));
    }
}

module.exports = ResponseModel;