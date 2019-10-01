class Check {
    constructor(server) {
        this.server = server
    }

    /**
     * Insert a check into the database.
     * A check is either a check in or check out.
     * It also saves time, project and method of checking
     * @param {Int} user_id ID of the user to be checked in or out
     * @param {Boolean} check_in If the check is in or out
     * @param {String} project Project name (optional)
     * @param {String} type Method of checking (web, card, slack, terminal)
     */
    async insert_check(user_id, check_in, project = null, type) {
        /** Get user from ID */
        var user = await this.server.User.get(user_id)
        if (user) {
            /** Get the users last check */
            var last_check = await this.get_last_check(user_id)
            /** Calcualte time between last check and now */
            var time_of_checkout = Date.now() - last_check.date
            /** If the user is checking out and their last check was in a project (aka currently checked into a project) 
             *  We need to add their time_of_checkout to thier work time on the project.
             */
            if (!check_in && last_check.project != "") {
                /** Get the project info */
                project = await this.server.Project.get(last_check.project)
                if (project) {
                    /** Make sure the project exists and then get the joint to make sure they are apart of the project */
                    var joint = await this.server.db.query_one("SELECT * FROM joints WHERE user = ? AND project = ?", [user.id, project.id])
                    if (joint) {
                        /** Add time worked on to the joint */
                        await this.server.db.query("UPDATE joints SET work = ? WHERE id = ?", [time_of_checkout + joint.work, joint.id])
                    }
                }
            }

            /** Clear project if it's not admitted */
            if (!check_in) project = ""
            if (!project) project = ""
            /** Insert check into the database */
            await this.server.db.query("INSERT INTO checks (user, check_in, project, date, type) VALUES (?, ?, ?, ?, ?)", [user_id, check_in, project, Date.now(), type])
            /** Log that the action has occurred */
            this.server.log(user.name + " checked " + (check_in ? "in" : "out") + " via " + type)
            return check_in
        }
    }
    /**
     * Check if a user is checked in
     * @param {*} user_id ID of the user
     */
    async is_checked_in(user_id) {
        /** Get last check and return if it was a check_in or check_out, aka if the user is currently checked in. */
        var checked_in = await this.get_last_check(user_id)
        return checked_in.check_in
    }

    /**
     * Get the last check from a user
     * If the user has never checked in before, it will look like a "check out" so 
     * it should behave the same for new users.
     * @param {*} user_id 
     */
    async get_last_check(user_id) {
        /** Get the last check from the database */
        var last_check_in = await this.server.db.query_one("SELECT * FROM checks WHERE user = ? ORDER BY date DESC LIMIT 1", user_id)
        if (!last_check_in) return {
            /** If the check doesnt exist, return a fake one so other functions can handle every case the same. */
            check_in: false,
            project: ""
        }
        return last_check_in
    }


    /**
     * Check in or out a user, with or without a project.
     * A user can check in again if they are already checked in but would like to switch
     * project. They will automatically be checked out and then in again in this function.
     * 
     * @param {Int} user_id ID of the user being checked in or out
     * @param {Boolean} check_in Force check_in or check_out (default: undefined, toggle-check-in)
     * @param {String} project_name Name of the project (optional)
     * @param {String} type Type of check in (web, slack, terminal, card)
     * @returns Success, if the check in/out was successfull
     */
    async check_in(user_id, check_in = null, project_name = null, type = "unknown") {
        var user = await this.server.User.get(user_id)
        if (user) {
            /** Get the last check from the user (to determine if they are currently checked in, how much time and what project.) */
            var last_check = await this.get_last_check(user.id)
            /** Check if a project was admitted */
            if (project_name != null && project_name != "" && project_name != undefined) {
                /** If project is admitted, load it from the DB */
                var project = await this.server.Project.get(project_name)
                /** Check if the project is definined, if so it's an existing project */
                if (project) {
                    /** Check if the user is apart of the project */
                    var owns_project = await this.server.Project.is_joined(user.id, project.id)
                    if (!owns_project) {
                        /** If they are not, refuse the check */
                        return {
                            success: false,
                            text: "User is not apart of this project."
                        }
                    }
                    /** Otherwise, update the project name to make sure capitalisation is right.
                     *  User has now been confirmed apart of the project requested
                     */
                    project_name = project.name
                } else {
                    /** Project not found from name */
                    return {
                        success: false,
                        text: "Project not found."
                    }
                }
            } else {
                /** No project admitted */
                project = ""
            }

            /** Allow toggle check ins if force checkin is not specified */
            if (check_in === null) check_in = !last_check.check_in

            /** Check IN the user */
            if (check_in === true) {
                /** Check if this is a redundant check in (same project and already checked in) */
                if (last_check.check_in && last_check.project === project_name) {
                    return {
                        success: true,
                        text: "You are already checked in." + (project_name ? " Project: " + project_name : "")
                    }
                }

                /** If users last check was a check in, this will check them out before checking them in. */
                if (last_check.check_in) {
                    this.check_in(user_id, false, null, type)
                }

                /** Insert the check in */
                await this.insert_check(user.id, true, project_name, type)
                return {
                    success: true,
                    checked_in: true,
                    text: "You are now checked in." + (project_name ? " Project: " + project_name : "")
                }
            }

            /** Check OUT the user */
            if (check_in === false) {
                /** Check if the user is already checked out */
                if (!last_check.check_in) {
                    return {
                        success: true,
                        text: "You are already checked out."
                    }
                }
                /** Insert checkout */
                await this.insert_check(user.id, false, project_name, type)
                return {
                    success: true,
                    checked_in: false,
                    text: `You are now checked out, ${this.server.format_time(Date.now() - last_check.date)}${project_name ? " (" + project_name + ")" : ""}.`,
                    project: project_name
                }
            }

        } else {
            return {
                success: false,
                text: "User not found."
            }
        }
    }

}

module.exports = Check