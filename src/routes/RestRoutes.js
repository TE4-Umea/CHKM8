class RestRoutes {
    constructor(server) {
        
        var user_controller = new (require('../controllers/user/UserController'))();
        var user_auth_controller = new (require('../controllers/user/UserAuthController'))();
        var user_check_controller = new (require('../controllers/user/UserCheckController'))();
        
        var project_user_controller = new (require('../controllers/project/ProjectUserController'))();
        var project_controller = new (require('../controllers/project/ProjectController'))();

        /* REST API routes */

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
            project_user_controller.store(req, res);
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
            project_controller.store(req, res);
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
         *         in: query
         *         required: true
         *         type: string
         *       - name: project
         *         description: project id to lookup.
         *         in: query
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
            project_controller.index(req, res);
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
            project_user_controller.destroy(req, res);
        });
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
            user_check_controller.store(req, res);
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
            user_auth_controller.store(req, res);
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
            user_controller.store(req, res);
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
         *         in: query
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
            user_controller.index(req, res);
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
         *         in: query
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
            user_controller.show(req, res);
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
            user_controller.update(req, res);
        });

        /**
         * @swagger
         * 
         * /api/project:
         *   delete:
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
         *      - project
         *     responses:
         *       200:
         *         description: Returns a success message and taken boolean as json.
         *       201:
         *         description: Retruns a error message as json.      
         */
        server.app.delete('/api/project', (req, res) => {
            project_controller.destroy(req, res);
        });

        /**
         * @swagger
         * 
         * /api/user/checks:
         *   get:
         *     description:
         *       Gets a list of checks associated with a user.
         *       IF the user that sends the request is admin, it is possible to get checks from multiple users. 
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: token
         *         description: Login authentication token.
         *         in: query
         *         required: true
         *         type: string
         *       - name: start_date
         *         description: 
         *          Start date as unix timestamp in milliseconds. IF this is specified end_date is required.
         *         in: query
         *         required: false
         *         type: int
         *       - name: end_date
         *         description: End date as UNIX timestamp in milliseconds. IF this is specified then start_date is required.
         *         in: query
         *         required: false
         *         type: int
         *       - name: ids
         *         description: Array of specified user ids. Only works if the token is of a admin.
         *         in: query
         *         required: false
         *         type: int[]
         *     tags:
         *      - user
         *     responses:
         *       200:
         *         description: Returns a success message and taken boolean as json.
         *       201:
         *         description: Retruns a error message as json.      
         */
        server.app.get('/api/user/checks', (req, res) => {
            user_check_controller.show(req, res);
        });
    }
}

module.exports = RestRoutes;
