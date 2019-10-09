class API {
    constructor() {
        this.Payload = require('../models/PayloadModel');
        this.Response = require('../models/ResponseModel');
        this.User = new (require('../User'))();
        this.Project = new (require('../Project'))();
    }

    async delete(req, res){
        // Gets attributes from request
        var payload = new this.Payload(req);
        // Loads ResponseModel
        var response = new this.Response(res);

        var project_to_delete = await this.Project.get_from_name(
            payload.Project
        );
        var user = await this.User.get_from_token(payload.token);
        var project = await this.Project.get_from_name(payload.project);
        // Checks if user has access to the project
        var has_access = await this.Project.is_joined(user.id, project.id);
        if (has_access) {
            response.json(
                await this.Project.delete_project(project_to_delete, project.id, user)
            );
        }
    }
}