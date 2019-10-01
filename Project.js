class Project {
    constructor(server) {
        this.server = server
    }


    /**
     * Get a project from it's name
     * @param {*} project_name The name of the project
     */
    async get(project_name) {
        if (project_name) {
            var project = await this.server.db.query_one("SELECT * FROM projects WHERE upper(name) = ?", project_name.toUpperCase())
            return project
        }
        return false
    }

    /**
     * Get a project from it's ID
     * @param {*} project_id ID of the project
     */
    async get_from_id(project_id) {
        if (project_id) {
            var project = await this.server.db.query_one("SELECT * FROM projects WHERE id = ?", project_id)
            return project
        }
        return false
    }


    /**
     * Returns boolean weather or not the user is apart of a project (owner or jointed)
     * @param {*} user_id ID of the user
     * @param {*} project_id ID of the project
     */
    async is_joined(user_id, project_id) {
        if (user_id && project_id) {
            var is_joined = await this.server.db.query_one("SELECT * FROM joints WHERE project = ? && user = ?", [project_id, user_id])
            var project = await this.get_from_id(project_id)
            if (project) {
                if (project.owner == user_id || is_joined) return true
            }
        }
        return false
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
     * @param {*} project_id ID of the project
     * @param {*} user User that did the request (optional) (if the user is unauthorized it will refuse the request)
     */
    async get_data(project_id, user = false) {
        /** Get project */
        var project = await this.get_from_id(project_id)
        if (project) {
            /** Get owner of project */
            var owner = await this.server.User.get(project.owner)
            
            /** Add owner to project return */
            project.owner = {
                id: owner.id,
                username: owner.username,
                name: owner.name
            }

            /** Create array for members in return */
            project.members = []
            /** Get all joints associated with the project */
            var joints = await this.server.db.query("SELECT * FROM joints WHERE project = ?", project_id)

            /** Loop through all joints and add the users to the memebers array */
            for (var joint of joints) {
                /** Get user */
                user = await this.server.User.get(joint.user)

                /** Push user to the array */
                project.members.push({
                    username: user.username,
                    name: user.name,
                    work: joint.work
                })
            }

            return {
                success: true,
                text: "Project return",
                project: project
            }
        }
        return {
            success: false,
            text: "Project not found"
        }
    }

    /**
     * Get list of projects
     * TODO: @Alex comment this
     */
    async get_list() {
        var projects = await this.server.db.query("SELECT name FROM projects")
        var project_list = "Project name, owner \n"
        var list_string = JSON.stringify(projects)
        var list = list_string.split(",")
        var list_lenght = list.length
        var to_add = ""
        var current_project = null
        var project_owner = ""
        for (var i = 0; i < list_lenght; i++) {
            to_add = list[i]
            to_add = to_add.split(":")[1]
            if (i == list.length - 1) {
                to_add = to_add.slice(to_add.indexOf('"') + 1, -3)
            } else {
                to_add = to_add.slice(to_add.indexOf('"') + 1, -2)
            }
            current_project = await this.get_project(to_add)
            project_owner = await this.server.User.get(current_project.owner)
            project_list += to_add + ", " + project_owner.name + "\n"
        }
        this.server.log("Getting projects list " + project_list)
        return {
            success: true,
            text: "Returning project list\n" + project_list
        }
    }

    
    /**
     * Remove user from project
     * @param {User} user_to_remove User to remove from project (can't be owner, but won't crash)
     * @param {String} project_name Project name of the project
     * @param {User} user User that requests the action
     */
    async remove_user(user_to_remove, project_id, user) {

        /** Makre sure all required attributes are admitted */
        if (!user_to_remove || !project_id || !user) {
            return {
                success: false,
                text: "Missing attirbutes"
            }
        }
        /** Get project */
        var project = await this.get_from_id(project_id)
        /** Make sure project exists */
        if (project) {
            /** Make sure the person leaving is not the owner (since they need to delete it to leave it) 
             *  TODO: Perhaps create a feature for transfering ownerships of projects?
             */
            if (project.owner == user_to_remove.id) {
                return {
                    success: false,
                    text: "User is the owner of the project (delete project to leave)"
                }
            }

            var is_joined = await this.is_joined(user_to_remove.id, project.id)
            var has_authority = await this.is_joined(user.id, project.id)

            if (is_joined) {
                if (has_authority) {
                    await this.server.db.query("DELETE FROM joints WHERE user = ? AND project = ?", [user_to_remove.id, project_id])
                    return {
                        success: true,
                        text: "User removed"
                    }
                } else {
                    return {
                        success: false,
                        text: "You are not allowed to modify this project"
                    }
                }
            } else {
                return {
                    success: false,
                    text: "User not found in project"
                }
            }
        } else {
            return {
                success: false,
                text: "Project not found"
            }
        }
    }

    async delete(project_name, user_id) {
        var user = await this.server.User.get(user_id)
        var project = await this.server.db.query_one("SELECT * FROM projects WHERE name = ?", project_name)
        if ((project.owner === user_id) || user.admin) {
            await this.server.db.query("DELETE FROM projects WHERE id = ?", project.id)
            await this.server.db.query("DELETE FROM joints WHERE project = ?", project.id)
            this.server.log("Project " + project_name + " deleted by: " + user.username)
            return {
                success: true,
                text: "Project deleted by: " + user.username
            }
        } else {
            var owner = await this.server.User.get(project.owner)
            return {
                success: false,
                text: "Permission denied, project is owned by " + owner.name
            }
        }
    }

    
    /**
     * 
     * @param {*} user_to_add 
     * @param {*} project_id 
     * @param {*} user 
     */
    async add_user(user_to_add, project_id, user) {
        if (!user_to_add) {
            return {
                success: false,
                text: "User not found"
            }
        }

        if (!user) {
            return {
                success: false,
                text: "Invalid token"
            }
        }

        if (!project_id) {
            return {
                success: false,
                text: "Project not found"
            }
        }

        var project = await this.get_from_id(project_id)
        if (project) {
            // Check if user is already in project
            var is_joined = await this.is_joined(user_to_add.id, project_id)
            if (is_joined) {
                return {
                    success: false,
                    text: "User is already apart of project"
                }
            }

            if (user) {
                var has_authority = await this.is_joined(user.id, project_id)
                if (!has_authority) {
                    return {
                        success: false,
                        text: "You dont have the authority to do this action"
                    }
                }
            }
            //Add the user to joints
            await this.server.db.query("INSERT INTO joints (project, user, date, work) VALUES (?, ?, ?, ?)", [project_id, user_to_add.id, Date.now(), 0])
            return {
                success: true,
                text: "Added " + user_to_add.name + " to " + project.name + "!"
            }
        }
        return {
            success: false,
            text: "Project doesnt exist"
        }
    }


    /**
     * 
     * @param {*} project_name 
     * @param {*} user 
     */
    async create(project_name, user) {
        if (!project_name || !user) return {
            success: false,
            text: "Missing project_name or user"
        }

        var existing_project = await this.get(project_name)
        if (existing_project) return {
            success: false,
            text: "Project name taken"
        }

        if (project_name.length > 30 || project_name < 3) {
            return {
                success: false,
                text: "Project name has to be between 3 > 30"
            }
        }

        if (project_name.replace(/[^a-z0-9_]+|\s+/gmi, "") !== project_name) {
            return {
                success: false,
                text: "Project name forbidden"
            }
        }

        var user_joints = await this.server.db.query("SELECT * FROM joints WHERE user = ?", user.id)
        var gradients = JSON.parse(this.server.fs.readFileSync("gradients.json", "utf8"))
        for (var joint of user_joints) {
            var project = await this.get_from_id(joint.project)
            for (var i = 0; i < gradients.length; i++) {
                if (gradients[i][0] == project.color_top) {
                    gradients.splice(i, 1)
                }
            }
        }

        if (gradients.length == 0) gradients = JSON.parse(this.server.fs.readFileSync("gradients.json", "utf8"))
        var gradiant = gradients[Math.floor(Math.random() * gradients.length)]

        await this.server.db.query("INSERT INTO projects (name, owner, color_top, color_bot) VALUES (?, ?, ?, ?)", [project_name, user.id, gradiant[0], gradiant[1]])
        var project = await this.get(project_name)
        await this.server.db.query("INSERT INTO joints (project, user, date, work) VALUES (?, ?, ?, ?)", [project.id, user.id, Date.now(), 0])

        return {
            success: true,
            text: "Created project " + project_name
        }
    }

}


module.exports = Project;