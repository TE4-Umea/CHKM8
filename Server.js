class Server {
    /**
     * Server side by Happy Surfers
     * Remember to comment your code!
     * Here we use underscore convention (variable_name, function_name())
     * 
     */
    constructor(config) {

        this.config = config

        // If the program is running in test mode (npm test)
        this.isInTest = typeof global.it === 'function'

        this.md5 = require("md5")
        this.bp = require("body-parser")
        this.express = require("express")
        this.http = require("http")
        this.https = require("https")
        this.fs = require("file-system")
        this.crypto = require("crypto")
        this.qs = require("qs")
        this.colors = require("colors")

        this.SlackAPI = require("./SlackAPI")

        this.API = require("./API")
        this.API = new this.API(this)

        /* Array of users ready to be linked to slack, cleared on restart. */
        this.slack_sign_users = []

        // Database async handler
        var Database = require("./Database")

        this.port = this.config.port

        this.db = new Database(this.config)

        // Setup the web server via express
        this.app = this.express()

        // Use body-parser to read json/type in post / get requests
        this.app.use(this.bp.json())
        this.app.use(this.bp.urlencoded({
            extended: true
        }))

        // Create the server and start it on the port in config.json
        this.server = this.http.createServer(this.app).listen(this.port)

        var Routes = require("./Routes")
            Routes = new Routes(this)

        this.Project = require("./Project")
        this.Project = new this.Project(this)

        this.User = require("./User")
        this.User = new this.User(this)


        this.on_loaded()
        this.SlackAPI = new this.SlackAPI(this.app, this)
    }

    /**
     * Log message with timestamp
     * Use this when a log should stay in the code
     * @param {*} message 
     */
    log(message) {
        // Dont display messages if it's in a test
        if (this.isInTest) return
        // Create timestamp
        var date = new Date()
        // Display message with timestamp
        console.log(`[${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}] ${message}`)
    }


    /**
     * This function runs when everything has been loaded.
     */
    on_loaded() {
        this.log(`Happy Surfer's TimeTracker has started on port: ${this.port}`)
    }

    /**
     * Create a new unique hash that can be used as a token 
     * (currently used in user tokens, config tokens and slack-sign-tokens)
     */
    hash() {
        return this.crypto.randomBytes(20).toString('hex').toUpperCase()
    }

    /**
     * Loads and sorts all documentation pages from /documentations. Parse them as JSON and compile them into
     * this.documentation
     */
    load_documentation() {
        this.documentation = []
        this.unsorted_documentation = []
        var pages = this.fs.readdirSync("documentation")

        for (var page of pages) {
            this.unsorted_documentation.push(JSON.parse(this.fs.readFileSync("documentation/" + page)))
        }

        this.unsorted_documentation.sort((a, b) => {
            return b.pinned
        })

        this.unsorted_documentation.sort((a, b) => {
            return a.type == "variable"
        })

        for (page of this.unsorted_documentation) {
            if (page.type == "text") {
                this.documentation.push(page)
            }
        }

        for (page of this.unsorted_documentation) {
            if (page.type == "class") {
                this.documentation.push(page)
                for (var p of this.unsorted_documentation) {
                    if (p.class == page.title) {
                        this.documentation.push(p)
                    }
                }
            }
        }
    }

    /**
     * Check in or out a user, with or without a project.
     * @param {Int} user_id ID of the user being checked in or out
     * @param {Boolean} check_in Force check_in or check_out (default: undefined, toggle-check-in)
     * @param {String} project_name Name of the project (optional)
     * @param {String} type Type of check in (web, slack, terminal, card)
     * @returns Success, if the check in/out was successfull
     */
    async check_in(user_id, check_in = null, project_name = null, type = "unknown") {
        var user = await this.User.get(user_id)
        if (user) {
            // Get last check in
            var last_check = await this.get_last_check(user.id)

            if (project_name != null && project_name != "" && project_name != undefined) {
                var project = await this.Project.get(project_name)
                if (project) {
                    var owns_project = await this.Project.is_joined(user.id, project.id)
                    if (!owns_project) {
                        return {
                            success: false,
                            text: "User is not apart of this project."
                        }
                    }
                    project_name = project.name
                } else {
                    return {
                        success: false,
                        text: "Project not found."
                    }
                }
            } else {
                project = ""
            }

            // Allow toggle check ins if force checkin is not specified
            if (check_in === null) check_in = !last_check.check_in

            if (check_in === true) {
                // Check if this is a redundant check in (same project and already checked in)
                if (last_check.check_in && last_check.project === project_name) {
                    return {
                        success: true,
                        text: "You are already checked in." + (project_name ? " Project: " + project_name : "")
                    }
                }

                // If users last check was a check in, this will check them out before checking them in.
                if (last_check.check_in) {
                    this.check_in(user_id, false, null, type)
                }

                // Insert the check in
                await this.insert_check(user.id, true, project_name, type)
                return {
                    success: true,
                    checked_in: true,
                    text: "You are now checked in." + (project_name ? " Project: " + project_name : "")
                }
            }

            // Check out user
            if (check_in === false) {
                // Check if the user is already checked out
                if (!last_check.check_in) {
                    return {
                        success: true,
                        text: "You are already checked out."
                    }
                }
                // Insert checkout
                await this.insert_check(user.id, false, project_name, type)
                return {
                    success: true,
                    checked_in: false,
                    text: `You are now checked out, ${this.format_time(Date.now() - last_check.date)}${project_name ? " (" + project_name + ")" : ""}.`,
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

    /* Reformat time from ms to hours and minutes (string friendly) */
    format_time(ms) {
        var hours = Math.floor(ms / 1000 / 60 / 60)
        var minutes = Math.floor((ms / 1000 / 60) - (hours * 60))
        return (hours ? hours + "h " : "") + minutes + "m"
    }


    /**
     * 
     * @param {*} user_id 
     * @param {*} check_in 
     * @param {*} project 
     * @param {*} type 
     */
    async insert_check(user_id, check_in, project = null, type) {
        var user = await this.User.get(user_id)
        var last_check = await this.get_last_check(user_id)
        if (user) {
            var time_of_checkout = Date.now() - last_check.date
            if (!check_in && last_check.project != "") {
                project = await this.Project.get(last_check.project)
                if (project) {
                    var joint = await this.db.query_one("SELECT * FROM joints WHERE user = ? AND project = ?", [user.id, project.id])
                    if (joint) {
                        await this.db.query("UPDATE joints SET work = ? WHERE id = ?", [time_of_checkout, joint.id])
                    }
                }
            }
            if (!check_in) project = ""
            if (!project) project = ""
            await this.db.query("INSERT INTO checks (user, check_in, project, date, type) VALUES (?, ?, ?, ?, ?)", [user_id, check_in, project, Date.now(), type])
            this.log(user.name + " checked " + (check_in ? "in" : "out") + " via " + type)
            return check_in
        }
    }
    /**
     * Check if a user is checked in
     * @param {*} user_id ID of the user
     */
    async is_checked_in(user_id) {
        var checked_in = await this.get_last_check(user_id)
        return checked_in.check_in
    }

    /**
     * 
     * @param {*} user_id 
     */
    async get_last_check(user_id) {
        var last_check_in = await this.db.query_one("SELECT * FROM checks WHERE user = ? ORDER BY date DESC LIMIT 1", user_id)
        if (!last_check_in) return {
            check_in: false,
            project: ""
        }
        return last_check_in
    }


    async get_slack_id_from_text(user) {
        var slack_id = user.substring(2, 11)
        user = await this.User.get_from_slack_id(slack_id)
        return user

    }






    verify_slack_request(req) {
        try {
            var slack_signature = req.headers['x-slack-signature']
            var request_body = this.qs.stringify(req.body, {
                format: 'RFC1738'
            })
            var timestamp = req.headers['x-slack-request-timestamp']
            var time = Math.floor(new Date().getTime() / 1000)
            if (Math.abs(time - timestamp) > 300) {
                return false
            }

            var sig_basestring = 'v0:' + timestamp + ':' + request_body
            var my_signature = 'v0=' +
                this.crypto.createHmac('sha256', this.config.signing_secret)
                .update(sig_basestring, 'utf8')
                .digest('hex')
            if (this.crypto.timingSafeEqual(
                    Buffer.from(my_signature, 'utf8'),
                    Buffer.from(slack_signature, 'utf8'))) {
                return true
            } else {
                return false
            }
        } catch (e) {
            console.log(e) // KEEP
            this.log("ERROR: Make sure your config.json:signing_secret is correct!")
        }
    }
}

module.exports = Server