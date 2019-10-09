class RestRoutes {
    constructor(server) {
        var api = new (require('../controllers/ApiController'));
        var project_api = new (require('../controllers/ProjectController'));

        /* REST API routes */

        /**
         * @swagger
         *
         * /api/user/check:
         *   post:
         *     description: Checks in user.
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: token
         *         description: Login authentication token.
         *         in: formData
         *         required: true
         *         type: string
         *       - name: check_in
         *         description: Variable responsible for checking whether user is already checked in.
         *         in: formData
         *         required: true
         *         type: boolean
         *       - name: project
         *         description: Specified project id that user is checking in with.
         *         required: false
         *         in: formData
         *         type: int
         *     tags:
         *       - user
         *     responses:
         *       200:
         *         description: Json with check in or out success and a text message.
         *       201:
         *         description: Json with error message.
         *
         */
        server.app.post('/api/user/check', (req, res) => {
            api.checkin(req, res);
        });

        /**
         * @swagger
         *
         * /api/project/user:
         *   post:
         *     description: Adds a user to a project
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: token
         *         description: Login authentication token.
         *         in: formData
         *         required: true
         *         type: string
         *       - name: username
         *         description: User's username.
         *         in: formData
         *         required: true
         *         type: string
         *       - name: project
         *         description: Specified project id that user wants to be added to.
         *         in: formData
         *         required: true
         *         type: string
         *     tags:
         *       - project
         *     responses:
         *       200:
         *         description: Json with login success and a text message.
         *       201:
         *         description: Json with error message.
         */
        server.app.post('/api/project/user', (req, res) => {
            api.add(req, res);
        });

        /**
         * @swagger
         *
         * /api/project:
         *   post:
         *     description: Creates new project
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: token
         *         description: Login authentication token.
         *         in: formData
         *         required: true
         *         type: string
         *       - name: project
         *         description: Specified project name.
         *         in: formData
         *         required: true
         *         type: string
         *     tags:
         *       - project
         *     responses:
         *       200:
         *         description: Json with login success and a text message.
         *       201:
         *         description: Json with error message.
         */
        server.app.post('/api/project', (req, res) => {
            api.new_project(req, res);
        });

        /**
         * @swagger
         *
         * /api/project/user:
         *   delete:
         *     description: Remove user from project
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: token
         *         description: Login authentication token for user that is removing others from project.
         *         in: formData
         *         required: true
         *         type: string
         *       - name: username
         *         description: Authenticate which user to remove.
         *         in: formData
         *         required: true
         *         type: string
         *       - name: project
         *         description: Variable to see which projects members are being modified
         *         required: true
         *         type: int
         *     tags:
         *       - project
         *     responses:
         *       200:
         *         description: Checks in user
         *       201:
         *         description: Json with error message.
         *
         */
        server.app.delete('/api/project/user', (req, res) => {
            api.remove(req, res);
        });

        /**
         * @swagger
         *
         * /api/project:
         *   get:
         *     description: Returns a specified project and all it's members and accompanied data.
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: token
         *         description: Login authentication token.
         *         in: formData
         *         required: true
         *         type: string
         *       - name: project
         *         description: project id to lookup.
         *         in: formData
         *         required: true
         *         type: int
         *     tags:
         *       - project
         *     responses:
         *       200:
         *         description: Json of with project data.
         *       201:
         *         description: Json with error message.
         *
         */
        server.app.get('/api/project', (req, res) => {
            api.project(req, res);
        });

        /**
         * @swagger
         *
         * /api/user/auth:
         *   post:
         *     description: Logins user to website.
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: username
         *         description: User username.
         *         in: formData
         *         required: true
         *         type: string
         *       - name: password
         *         description: User password.
         *         in: formData
         *         required: true
         *         type: string
         *     tags:
         *       - user
         *     responses:
         *       200:
         *         description: Returns a success message and a login token as json.
         *       201:
         *         description: Retruns a error message as json.
         *
         */
        server.app.post('/api/user/auth', (req, res) => {
            api.login(req, res);
        });

        /**
         * @swagger
         *
         * /api/user:
         *   post:
         *     description: Registers a new user to website.
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: username
         *         description: new users username.
         *         in: formData
         *         required: true
         *         type: string
         *       - name: password
         *         description: User password.
         *         in: formData
         *         required: true
         *         type: string
         *       - name: name
         *         description: Users full name.
         *         in: formData
         *         required: true
         *         type: string
         *     tags:
         *       - user
         *     responses:
         *       200:
         *         description: Returns a success message and a login token as json.
         *       201:
         *         description: Retruns a error message as json.
         *
         */

        server.app.post('/api/user', (req, res) => {
            api.signup(req, res);
        });

        /**
         * @swagger
         *
         * /api/user:
         *   get:
         *     description: Gets user data specified by token.
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: token
         *         description: Login authentication token.
         *         in: formData
         *         required: true
         *         type: string
         *     tags:
         *       - user
         *     responses:
         *       200:
         *         description: Returns a success message and user data as json.
         *       201:
         *         description: Retruns a error message as json.
         *
         */
        server.app.get('/api/user', (req, res) => {
            api.profile(req, res);
        });

        /**
         * @swagger
         *
         * /api/user/taken:
         *   get:
         *     description: Checks if a username is taken.
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: username
         *         description: Lookup username.
         *         in: formData
         *         required: true
         *         type: string
         *     tags:
         *       - user
         *     responses:
         *       200:
         *         description: Returns a success message and taken boolean as json.
         *       201:
         *         description: Retruns a error message as json.
         *
         */
        server.app.get('/api/user/taken', (req, res) => {
            api.username_taken(req, res);
        });

        /**
         * @swagger
         *
         * /api/user/slack:
         *   patch:
         *     description: Links a Authenticated user with a slack user.
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: sign_token
         *         description: Slack linking token from slack OAuth.
         *         in: formData
         *         required: true
         *         type: string
         *       - name: token
         *         description: Login authentication token.
         *         in: formData
         *         required: true
         *         type: string
         *     tags:
         *       - user
         *     responses:
         *       200:
         *         description: Returns a success message and taken boolean as json.
         *
         */
        server.app.patch('/api/user/slack', (req, res) => {
            api.sign(req, res);
        });

        /**
         * @swagger
         * 
         * /api/project:
         *   patch:
         *     description: Deletes project from database.
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: project
         *         description: Name of the project to be deleted
         *         in: formData
         *         required: true
         *         type: string
         *       - name: token
         *         description: Token of the user that deletes the project
         *         in: form
         *         required: true
         *         type: string
         *     tags:
         *      - user
         *     responses:
         *       200:
         *         description: Returns a success message and taken boolean as json.
         *       201:
         *         description: Retruns a error message as json.      
         */
        server.app.delete('/api/project', (req, res) => {
            project_api.delete(req, res);
        });
    }
}

module.exports = RestRoutes;
