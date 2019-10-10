/**
 * Project.js -- CHKM8 NTI TE4 2019
 * All things projects are handled in here
 * There are not static functions so make sure you
 * create a new instance of it before using it!
 */
class Project {
    /**
     * Create a new instance of Project.
     * This requires all dependencies and connectes to the Database.
     * There are not static functions in this class.
     */
    constructor() {
        var ConfigLoader = require('./ConfigLoader');
        ConfigLoader = new ConfigLoader();
        this.Database = require('./Database');
        this.db = new this.Database(ConfigLoader.load());

        // Require FS file system to read gradients.json
        this.fs = require('file-system');
        // Require the User class
        this.User = require('./User');
        this.User = new this.User();

        // JSONResponse is the standard response system for CHKM8
        this.JSONResponse = require('./models/JSONResponseModel');
        /* this.JSONResponse = new this.JSONResponse() */
        this.SuccessResponse = this.JSONResponse.SuccessResponse;
        this.ErrorResponse = this.JSONResponse.ErrorResponse;
    }

    /**
     * Get a project from it's ID
     * @param {Number} project_id ID of the project
     * @returns {Object|Boolean} Project object, false if no project id is specified or if no project is found.
     */
    async get(project_id) {
        if (!project_id) return false;

        var project = await this.db.query_one(
            'SELECT * FROM projects WHERE id = ?',
            project_id
        );
        return project;
    }

    /**
     * Get a project from it's name
     * @param {String} project_name The name of the project
     * @returns {Object|Boolean} Project object, false if no project name is specified or if no project is found.
     */
    async get_from_name(project_name) {
        if (typeof project_name != 'string') return false;
        var project = await this.db.query_one(
            'SELECT * FROM projects WHERE upper(name) = ?',
            project_name.toUpperCase()
        );
        return project;
    }

    /**
     * Returns boolean weather or not the user is apart of a project (owner or jointed)
     * @param {Number} user_id ID of the user
     * @param {Number} project_id ID of the project
     * @returns {Boolean} true if user is part of the project, otherwise false.
     */
    async is_joined(user_id, project_id) {
        if (user_id && project_id) {
            var is_joined = await this.db.query_one(
                'SELECT * FROM joints WHERE project = ? && user = ?',
                [project_id, user_id]
            );
            var project = await this.get(project_id);
            if (project) {
                if (project.owner == user_id || is_joined) return true;
            }
        }
        return false;
    }

    /**
     * Get data about project
     * Returns {
     *      name,
     *      id,
     *      owner: {Int id, String username, String name},
     *      members: [ Member {String username, String name, Int work} ],
     *      color_top,
     *      color_bot
     * }
     * @param {Number} project_id ID of the project
     * @param {User} user User that did the request (optional) (if the user is unauthorized it will refuse the request)
     * @returns {Object|JSONResponse} Project data contained within an object.
     */
    async get_data(project_id, user = false) {
        /** Get project */
        var project = await this.get(project_id);
        if (project) {
            /** Get owner of project */
            var owner = await this.User.get(project.owner);

            /** Add owner to project return */
            project.owner = new ProjectOwner(
                owner.id,
                owner.username,
                owner.name
            );

            /** Create array for members in return */
            project.members = [];

            /** Get all joints associated with the project */
            var joints = await this.db.query(
                'SELECT * FROM joints WHERE project = ?',
                project_id
            );

            /** Loop through all joints and add the users to the memebers array */
            for (var joint of joints) {
                /** Get user */
                user = await this.User.get(joint.user);
                /** Push user to the array */
                project.members.push(
                    new ProjectMember(user.username, user.name, joint.work)
                );
            }
            return new this.SuccessResponse('Project return', { project });
        }
        return new this.ErrorResponse('Project return');
    }

    /**
     * Remove user from project
     * @param {User} user_to_remove User to remove from project (can't be owner, but won't crash)
     * @param {Number} project_id Project name of the project
     * @param {User} user User that requests the action
     * @returns {JSONResponse}
     */
    async remove_user(user_to_remove, project_id, user) {
        /** Make sure all required attributes are admitted */
        if (!user_to_remove || !project_id || !user)
            return new this.ErrorResponse('Missing attributes');
        /** Get project */
        var project = await this.get(project_id);
        /** Make sure project exists */
        if (!project) return new this.ErrorResponse('Project not found');
        /** Make sure the person leaving is not the owner (since they need to delete it to leave it)
         *  TODO: Perhaps create a feature for transfering ownerships of projects?
         */
        if (project.owner == user_to_remove.id)
            return new this.ErrorResponse(
                'User is the owner of the project (delete project to leave)'
            );

        /** Make sure the user to be removed is in the project */
        var is_joined = await this.is_joined(user_to_remove.id, project.id);
        /** Make sure user that requested the change is also apart of the project  */
        var has_authority =
            (await this.is_joined(user.id, project.id)) || user.admin;

        if (!is_joined)
            return new this.ErrorResponse('User not found in project');
        if (!has_authority)
            return new this.ErrorResponse(
                'You are not allowed to modify this project'
            );

        await this.db.query(
            'DELETE FROM joints WHERE user = ? AND project = ?',
            [user_to_remove.id, project_id]
        );
        return new this.SuccessResponse('User removed');
    }

    /**
     * Remove project
     * @param {String} project_name Name of the project.
     * @param {Number} user_id ID of the user.
     * @returns {JSONResponse}
     */
    async delete(project_name, user_id) {
        // Get user and project
        var user = await this.User.get(user_id);
        var project = await this.get_from_name(project_name);
        // Return error if user or project not found
        if (!user || !project)
            return new this.ErrorResponse('User or project not found');
        // Make sure the requestor is the owner or an admin
        if (project.owner !== user_id && !user.admin) {
            // Get the owners name if the requestor does not have access
            var owner = await this.User.get(project.owner);
            // Respond with error
            return new this.ErrorResponse(
                'Permission denied, project is owned by ' + owner.name
            );
        }
        // Delete all joitns
        await this.db.query('DELETE FROM joints WHERE project = ?', project.id);
        // Delete project
        await this.db.query('DELETE FROM projects WHERE id = ?', project.id);

        return new this.SuccessResponse('Project ' + project_name + ' deleted by: ' + user.username);
    }

    /**
     * Add user to project.
     * @param {User} user_to_add User being added to project
     * @param {Number} project_name ID of project to add user to.
     * @param {User} user User that requests the action.
     * @returns {JSONResponse}
     */
    async add_user(user_to_add, project_name, user) {
        // If user doesn't exist
        if (!user_to_add)
            return new this.SuccessResponse(
                'User: ' + user_to_add.username + ' not found'
            );
        // If your token is wrong
        if (!user) return new this.ErrorResponse('Invalid token');

        var project = await this.get_from_name(project_name);

        // If project doesn't exist
        if (!project)
            return new this.ErrorResponse(
                'Project: ' + project_name + ' not found'
            );
        // Check if user is already in project
        var is_joined = await this.is_joined(user_to_add.id, project.id);
        // Make sure user has authority to add the user (either project member or admin)
        var has_authority =
            (await this.is_joined(user.id, project.id)) || user.admin;

        if (!has_authority)
            return new this.ErrorResponse(
                "You dont't have authority to do this."
            );
        if (is_joined)
            return new this.ErrorResponse(
                'User: ' +
                    user_to_add.username +
                    ' is already apart of project.'
            );

        //Add the user to joints
        await this.db.query(
            'INSERT INTO joints (project, user, work) VALUES (?, ?, ?)',
            [project.id, user_to_add.id, 0]
        );
        return new this.SuccessResponse(
            'Added ' + user_to_add.name + ' to ' + project.name + '!'
        );
    }

    /**
     * Create new project
     * @param {String} project_name Requested name for the new project.
     * @param {Object} user User that requests the action.
     * @returns {JSONResponse}
     */
    async create(project_name, user) {
        // Make sure required attributes are admitted
        if (!project_name || !user)
            return new this.ErrorResponse('Missing project_name or user');

        // Make sure the project doesn't already exist (projcet name taken)
        var existing_project = await this.get_from_name(project_name);
        if (existing_project)
            return new this.ErrorResponse('Project name taken');

        // Make sure project name is less than 30 chars long and more than 3.
        if (project_name.length > 30 || project_name < 3)
            return new this.ErrorResponse(
                'Project name has to be between 3 > 30'
            );

        // Make sure project name is valid
        if (project_name.replace(/[^a-z0-9_]+|\s+/gim, '') !== project_name)
            return new this.ErrorResponse('Project name forbidden');

        /* Generate gradients from project. */
        var gradient = await this.new_gradient(user.id);
        
        // Insert the new project into DB
        await this.db.query(
            'INSERT INTO projects (name, owner, color_top, color_bot) VALUES (?, ?, ?, ?)',
            [project_name, user.id, gradient[0], gradient[1]]
        );
        // Get the project back to get its ID and make sure the creation went smooth
        var project = await this.get_from_name(project_name);
        // Inster a new joint for the owner for this project
        await this.db.query(
            'INSERT INTO joints (project, user, work) VALUES (?, ?, ?)',
            [project.id, user.id, 0]
        );
        // Return success
        return new this.SuccessResponse('Created project ' + project_name);
    }

    /**
     * Get a new gradient for a project on creation.
     * This selects a random gradient from the gradients.json file.
     * It also tries to not return an already used gradient by the user.
     *
     * @param {Int} user_id ID of the user that is creating a new project
     * @returns {Array} gratident
     */
    async new_gradient(user_id) {
        // Get all projects the user is apart of
        var user_joints = await this.db.query(
            'SELECT * FROM joints WHERE user = ?',
            user_id
        );
        // Read gradients file and parse it
        var gradients = JSON.parse(
            this.fs.readFileSync('gradients.json', 'utf8')
        );
        // Loop through all joints and exlude the used gradients to try and give the project a new unique gradient!
        for (var joint of user_joints) {
            // Get the project from the joint
            var project = await this.get(joint.project);
            // Loop through all avalible gradients and remove them if they are the same as the gradient
            for (var i = 0; i < gradients.length; i++) {
                // Check if the gradients match
                if (gradients[i][0] == project.color_top) {
                    // Remove gradient from list
                    gradients.splice(i, 1);
                }
            }
        }

        if (gradients.length == 0)
            gradients = JSON.parse(
                this.fs.readFileSync('gradients.json', 'utf8')
            );
        return gradients[Math.floor(Math.random() * gradients.length)];
    }

    /**
     * Gets all the projects and their owner
     * 
     */
    async get_projects() {
        var projects_list = await this.db.query('SELECT projects.name, users.username FROM projects JOIN users WHERE users.id = owner;');
        return JSON.parse(JSON.stringify(projects_list));
    }
}

class ProjectOwner {
    /**
     * @param {Number} id
     * @param {String} username
     * @param {String} name
     * @returns {Object}
     */
    constructor(id, username, name) {
        var res = { id, username, name };
        return res;
    }
}

class ProjectMember {
    /**
     * @param {String} username
     * @param {String} name
     * @param {Number} work
     * @returns {Object}
     */
    constructor(username, name, work) {
        var res = { username, name, work };
        return res;
    }
}

module.exports = Project;
