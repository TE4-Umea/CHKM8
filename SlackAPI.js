        /*
        TEMPLATE
        app.post("/api/slack/PATH", async (req, res) => {
            var success = server.verify_slack_request(req)
            if (success) {
                var user = await server.get_user_from_slack(req)
                if (user) {
                    
                } else {
                    this.user_not_found(res)
                }
            }
        })
        
         */


        class SlackAPI {
            
            constructor(app, server) {
                var SlackJSON = require("./SlackJSON")
                this.SlackJSON = new SlackJSON()

                this.SUCCESS = "#2df763"
                this.FAIL = "#f72d4b"
                this.WARN = "#f7c52d"

                app.get("/auth", async (req, res) => {
                    if (req.query.code) {
                        /* Send a request to slack to get user information from the login */
                        server.https.get(`https://slack.com/api/oauth.access?client_id=${server.config.client_id}&client_secret=${server.config.client_secret}&code=${req.query.code}`, resp => {
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
                                        var slack_taken = await server.db.query_one("SELECT * FROM users WHERE slack_id = ?", data.user.id)
                                        if(slack_taken){
                                            res.send("This slack account is already linked to another user. Please   that account first or ask an administrator for help.")
                                            return
                                        }
                                        
                                        var sign_token = server.hash()
                                        server.slack_sign_users.push({
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
                })

                app.post("/api/slack/checkin", async (req, res) => {
                    var success = server.verify_slack_request(req)
                    if (success) {
                        var user = await server.get_user_from_slack(req)
                        if (user) {
                            var project = req.body.text ? req.body.text : ""
                            var response = await server.check_in(user.id, true, project, "slack")
                            res.json(this.slack_response(response))
                        } else {
                            this.user_not_found(res)
                        }
                    }
                })

                app.post("/api/slack/checkout", async (req, res) => {
                    var success = server.verify_slack_request(req)
                    if (success) {
                        var user = await server.get_user_from_slack(req)
                        if (user) {
                            var response = await server.check_in(user.id, false, null, "slack")
                            res.json(this.slack_response(response))
                        } else {
                            this.user_not_found(res)
                        }
                    }
                })

                app.post("/api/slack/remove", async (req, res) => {
                    var success = server.verify_slack_request(req)
                    if (success) {
                        var user = await server.get_user_from_slack(req)
                        if (user) {
                            var inputs = req.body.text.split(" ")
                            var user_to_remove = inputs[0]
                            if (user_to_remove.startsWith("<@")) {
                                user_to_remove = await server.get_slack_id_from_text(user_to_remove)
                            } else {
                                user_to_remove = await server.get_user_from_username(user_to_remove)
                            }
                            var project_name = inputs[1]
                            var project = await server.get_project(project_name)
                            var response = await server.remove_user_from_project(user_to_remove, project.id, user)
                            res.json(this.slack_response(response))
                        } else {
                            this.user_not_found(res)
                        }
                    }
                })


                app.post("/api/slack/add", async (req, res) => {
                    var success = server.verify_slack_request(req)
                    if (success) {
                        var user = await server.get_user_from_slack(req)
                        if (user) {
                            var inputs = req.body.text.split(" ")
                            var user_to_add = inputs[0]
                            if (user_to_add.startsWith("<@")) {
                                user_to_add = await server.get_slack_id_from_text(user_to_add)
                            } else {
                                user_to_add = await server.get_user_from_username(user_to_add)
                            }
                            var project_name = inputs[1]
                            var project = await server.get_project(project_name)

                            var response = await server.add_user_to_project(user_to_add, project ? project.id : -1, user)
                            res.json(this.slack_response(response))

                        } else {
                            this.user_not_found(res)
                        }
                    }
                })


                app.post("/api/slack/new", async (req, res) => {
                    var success = server.verify_slack_request(req)
                    if (success) {
                        var user = await server.get_user_from_slack(req)
                        if (user) {
                            var project_name = req.body.text
                            var response = await server.create_project(project_name, user)
                            res.json(this.slack_response(response))
                        } else {
                            this.user_not_found(res)
                        }
                    }
                })

                app.post("/api/slack/help", async (req, res) => {
                    var response = this.SlackJSON.SlackResponse("Happy Surfers Time App Help Menu", [this.SlackJSON.SlackAttachments(server.fs.readFileSync("commands.md", "utf8"))])
                    res.json(response)
                })

                app.post("/api/slack/delete", async (req, res) => {
                    var success = server.verify_slack_request(req)
                    if (success) {
                        var user = await server.get_user_from_slack(req)
                        if (user) {
                            var project_to_delete = req.body.text
                            var response = await server.delete_project(project_to_delete, user.id)
                            res.json(this.slack_response(response))
                        } else {
                            this.user_not_found(res)
                        }
                    }
                })
                app.post("/api/slack/project", async (req, res) => {
                    var success = server.verify_slack_request(req)
                    if (success) {
                        var user = await server.get_user_from_slack(req)
                        if (user) {
                            var input = req.body.text
                            server.log("INPUT: " + input)
                            var response = null
                            var project_to_info = await server.get_project(input)
                            if (input == "") {
                                server.log("Getting project list " + project_to_info.name)
                                response = await server.get_project_list()
                            } else {
                                
                                server.log("Getting project info for: " + project_to_info.name)
                                response = await server.get_project_data(project_to_info.id)
                                var list_members = response.project.members
                                var members = ""
                                //TODO: fix members lenght, currently undefined
                                server.log(list_members.lenght  + " " + list_members[0].name)
                                for (var i = 0; list_members.lenght; i++) {
                                    members += list_members[i].name + " Time: " + list_members[i].work + "\n"
                                    server.log("BEST TEST" + i + members)
                                }
                                var output = "Owner: " + response.project.owner.name + "\n Members: " + members
                                response.text = "Project info for " + project_to_info.name + ":\n" + output
                            }
                            res.json(this.slack_response(response))
                        } else {
                            this.user_not_found(res)
                        }
                    }
                })
            }

            slack_response(response) {
                return this.SlackJSON.SlackResponse(response.success ? "Success!" : "Something went wrong...", [this.SlackJSON.SlackAttachments(response.text, response.success ? this.SUCCESS : this.FAIL)])
            }

            user_not_found(res) {
                res.json(this.SlackJSON.SlackResponse("Please register an account and link it before using slash commands", [this.SlackJSON.SlackAttachments("https://hs.ygstr.com/login")]))
            }
        }

        module.exports = SlackAPI