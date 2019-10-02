class SlackAPI {
    
    constructor(server) {
        this.server = server
        this.qs = require("qs")
        var SlackJSON = require("./SlackJSON")
        this.SlackJSON = new SlackJSON()

        this.SUCCESS = "#2df763"
        this.FAIL = "#f72d4b"
        this.WARN = "#f7c52d"
    }

    async get_slack_id_from_text(user) {
        var slack_id = user.substring(2, 11)
        user = await this.server.User.get_from_slack_id(slack_id)
        return user

    }

    /**
     * Authenticate user via login with slack button and link their slack account
     * to their chkm8 account. They get sent a sign_token and that is managed by
     * API.sign()
     * @param {*} req 
     * @param {*} res 
     */
    async auth(req, res) {
        if (req.query.code) {
            /* Send a request to slack to get user information from the login */
            this.server.https.get(`https://slack.com/api/oauth.access?client_id=${this.server.config.client_id}&client_secret=${this.server.config.client_secret}&code=${req.query.code}`, resp => {
                var data = ''
                resp.on('data', (chunk) => {
                    data += chunk
                })
                resp.on('end', () => {
                    /* Once the data has been downloaded, parse it into a JSON */
                    data = JSON.parse(data)
                    /* If the request and code was successfull */
                    if (data.ok) {
                        (async () => {
                            /* Check if the user is already signed up */
                            var slack_taken = await this.server.db.query_one("SELECT * FROM users WHERE slack_id = ?", data.user.id)
                            if (slack_taken) {
                                res.send("This slack account is already linked to another user. Please   that account first or ask an administrator for help.")
                                return
                            }

                            var sign_token = this.server.hash()
                            this.server.slack_sign_users.push({
                                access_token: data.access_token,
                                slack_domain: data.team.domain,
                                slack_id: data.user.id,
                                name: data.user.name,
                                avatar: data.user.image_512,
                                email: data.user.email,
                                token: sign_token
                            })
                            res.render("dashboard", {
                                token: sign_token
                            })
                        })()

                    } else {
                        res.end(data.error)
                    }
                })
            })
        } else {
            res.end("Error..?")
        }
    }

    async check_in(req, res) {
        var success = this.verify_slack_request(req)
        if (success) {
            var user = await this.server.User.get_from_slack(req)
            if (user) {
                var project = req.body.text ? req.body.text : ""
                var response = await this.server.Check.check_in(user.id, true, project, "slack")
                res.json(this.slack_response(response))
            } else {
                this.user_not_found(res)
            }
        }
    }

    async check_out(req, res) {
        var success = this.verify_slack_request(req)
        if (success) {
            var user = await this.server.User.get_from_slack(req)
            if (user) {
                var response = await this.server.Check.check_in(user.id, false, null, "slack")
                res.json(this.slack_response(response))
            } else {
                this.user_not_found(res)
            }
        }
    }

    async remove(req, res) {
        var success = this.verify_slack_request(req)
        if (success) {
            var user = await this.server.User.get_from_slack(req)
            if (user) {
                var inputs = req.body.text.split(" ")
                var user_to_remove = inputs[0]
                if (user_to_remove.startsWith("<@")) {
                    user_to_remove = await this.get_slack_id_from_text(user_to_remove)
                } else {
                    user_to_remove = await this.server.User.get_from_username(user_to_remove)
                }
                var project_name = inputs[1]
                var project = await this.server.Project.get(project_name)
                var response = await this.server.Project.remove_user(user_to_remove, project.id, user)
                res.json(this.slack_response(response))
            } else {
                this.user_not_found(res)
            }
        }
    }

    async add(req, res) {
        var success = this.verify_slack_request(req)
        if (success) {
            var user = await this.server.User.get_from_slack(req)
            if (user) {
                var inputs = req.body.text.split(" ")
                var user_to_add = inputs[0]
                if (user_to_add.startsWith("<@")) {
                    user_to_add = await this.get_slack_id_from_text(user_to_add)
                } else {
                    user_to_add = await this.server.User.get_from_username(user_to_add)
                }
                var project_name = inputs[1]
                var project = await this.server.Project.get(project_name)

                var response = await this.server.Project.add_user(user_to_add, project ? project.id : -1, user)
                res.json(this.slack_response(response))

            } else {
                this.user_not_found(res)
            }
        }
    }

    async new_project(req, res) {
        var success = this.verify_slack_request(req)
        if (success) {
            var user = await this.server.User.get_from_slack(req)
            if (user) {
                var project_name = req.body.text
                var response = await this.server.create_project(project_name, user)
                res.json(this.slack_response(response))
            } else {
                this.user_not_found(res)
            }
        }
    }

    async help(req, res) {
        var response = this.SlackJSON.SlackResponse("Happy Surfers Time App Help Menu", [this.SlackJSON.SlackAttachments(this.server.fs.readFileSync("commands.md", "utf8"))])
        res.json(response)
    }

    async delete_project(req, res) {
        var success = this.verify_slack_request(req)
        if (success) {
            var user = await this.server.User.get_from_slack(req)
            if (user) {
                var project_to_delete = req.body.text
                var response = await this.server.delete_project(project_to_delete, user.id)
                res.json(this.slack_response(response))
            } else {
                this.user_not_found(res)
            }
        }
    }

    

    async project(req, res) {
        var success = this.verify_slack_request(req)
        if (success) {
            var user = await this.server.User.get_from_slack(req)
            if (user) {
                var input = req.body.text
                this.server.log("INPUT: " + input)
                var response = null
                var project_to_info = await this.server.Project.get(input)
                if (input == "") {
                    this.server.log("Getting project list " + project_to_info.name)
                    response = await this.server.Project.get_list()
                } else {

                    this.server.log("Getting project info for: " + project_to_info.name)
                    response = await this.server.Project.get_data(project_to_info.id)
                    var list_members = response.project.members
                    var members = ""
                    //TODO: fix members lenght, currently undefined
                    this.server.log(list_members.lenght + " " + list_members[0].name)
                    for (var i = 0; list_members.lenght; i++) {
                        members += list_members[i].name + " Time: " + list_members[i].work + "\n"
                        this.server.log("BEST TEST" + i + members)
                    }
                    var output = "Owner: " + response.project.owner.name + "\n Members: " + members
                    response.text = "Project info for " + project_to_info.name + ":\n" + output
                }
                res.json(this.slack_response(response))
            } else {
                this.user_not_found(res)
            }
        }
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
                this.server.crypto.createHmac('sha256', this.server.config.signing_secret)
                .update(sig_basestring, 'utf8')
                .digest('hex')
            if (this.server.crypto.timingSafeEqual(
                    Buffer.from(my_signature, 'utf8'),
                    Buffer.from(slack_signature, 'utf8'))) {
                return true
            } else {
                return false
            }
        } catch (e) {
            console.log(e) // KEEP
            this.server.log("ERROR: Make sure your config.json:signing_secret is correct!")
        }
    }

    slack_response(response) {
        return this.SlackJSON.SlackResponse(response.success ? "Success!" : "Something went wrong...", [this.SlackJSON.SlackAttachments(response.text, response.success ? this.SUCCESS : this.FAIL)])
    }

    user_not_found(res) {
        res.json(this.SlackJSON.SlackResponse("Please register an account and link it before using slash commands", [this.SlackJSON.SlackAttachments("https://hs.ygstr.com/login")]))
    }
}

module.exports = SlackAPI