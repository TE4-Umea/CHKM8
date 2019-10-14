class ProjectUserController {

    constructor() {
        this.Payload = require('../../models/PayloadModel');
        this.Response = require('../../models/ResponseModel');
        this.User = new (require('../../User'))();
        this.Project = new (require('../../Project'))();
    }

    /**
     * Adds a user to a project and stores it in a piviot table.
     * @param {*} req
     * @param {*} res
     * @returns A json response with success or fail
     */
    async store(req, res) {
        /** Get attributes from request */
        var payload = new this.Payload(req);
        // Loads ResponseModel
        var response = new this.Response(res);
        /** Load user safe from token */
        var user = await this.User.get_from_token(payload.token);
        /** Load user that will be added */
        var user_to_add = await this.User.get_from_username(payload.username);
        /** Add the user to the project via the requesting user */
        /** Responde to the user */
        response.json(
            await this.Project.add_user(user_to_add, payload.project, user)
        );
    }

    /**
     * Remove user from project
     * @param {*} req
     * @param {*} res
     * @returns A json response with success or fail
     */
    async destroy(req, res) {
        /** Get attributes from request */
        var payload = new this.Payload(req);
        // Loads ResponseModel
        var response = new this.Response(res);
        var user_to_remove = await this.User.get_from_username(
            payload.username
        );
        var user = await this.User.get_from_token(payload.token);
        var project = await this.project.get_from_name(payload.project);
        response.json(
            await this.Project.remove_user(user_to_remove, project.id, user)
        );
    }
}

module.exports = ProjectUserController;