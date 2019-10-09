/**
 * REST API for CHKM8
 */

class API {
    constructor() {
        this.Payload = require('../models/PayloadModel');
        this.Response = require('../models/ResponseModel');
        this.User = new (require('../User'))();
        this.Project = new (require('../Project'))();
    }

    /**
     * Create a new project
     * REQ: {token, project}
     * @param {*} req
     * @param {*} res
     */
    async new_project(req, res) {
        /** Get attributes from request */
        var payload = new this.Payload(req);
        // Loads ResponseModel
        var response = new this.Response(res);
        /** Get the user safley from token */
        var user = await this.User.get_from_token(payload.token);
        /** Make sure user is loaded correctly */
        if (user) {
            /** Create the project via the user and project name and respond to the request with res */
            response.json(await this.Project.create(payload.project, user));
        } else {
            response.error_response('Invalid Token');
        }
    }

    /**
     * POST /api/project. Returns a json with the status of a given project.
     * Get information of a project and all the members
     * @param {Request} req
     * @param {Response} res
     */
    async project(req, res) {
        /** Get attributes from request */
        var payload = new this.Payload(req);
        // Loads ResponseModel
        var response = new this.Response(res);

        /** Read from server via attributes */
        var user = await this.User.get_from_token(payload.token);
        var project = await this.Project.get(payload.project);
        var project_data = await this.Project.get_data(project.id);
        /** Make sure user and project exists */
        if (user && project) {
            var has_access = await this.Project.is_joined(user.id, project.id);
            // Make sure the project data exists.
            if (project_data) {
                if (has_access) {
                    response.success_response('sucess', {
                        project: project_data,
                    });
                } else {
                    response.error_response(
                        `You don't have access to this project`
                    );
                }
            }
        } else if (!user) {
            // If user does not exist, invalid token.
            response.error_response('Invalid token');
        } else if (!project) {
            // If project does not exist, then prject not found.
            response.error_response('Project not found');
        } else if (!project_data) {
            // If project data does not exist, then project data is corrupt.
            response.error_response('Project data corrupt');
        } else {
            response.error_response('Something went wrong.');
        }
    }
}

module.exports = API;
