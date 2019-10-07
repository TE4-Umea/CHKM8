class RestRoutes {
    constructor(server) {
        // TODO Remove server dependencies.
        var api = new (require('../controllers/ApiController'))(server);

        /* REST API routes */

        /**
         * @swagger
         *
         * /api/checkin:
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
         *         type: int
         *     tags:
         *       - project 
         *     responses:
         *       200:
         *         description: Json with check in or out success and a text message.
         *       201:
         *         description: Json with error message.
         * 
         */
        server.app.post('/api/checkin', api.checkin);

        /**
         * @swagger
         *
         * /api/add:
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
        server.app.post('/api/add', api.add);

        /**
         * @swagger
         *
         * /api/new:
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
        server.app.post('/api/new', api.new_project);

        /**
         * @swagger
         *
         * /api/remove:
         *   post:
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
        server.app.post('/api/remove', api.remove);

        /**
         * @swagger
         *
         * /api/project:
         *   post:
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
        server.app.post('/api/project', api.project);

        /**
         * @swagger
         *
         * /api/login:
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
         *       - auth
         *     responses:
         *       200: 
         *         description: Returns a success message and a login token as json.
         *       201:
         *         description: Retruns a error message as json.
         * 
         */
        server.app.post('/api/login', api.login);
        
        /**
         * @swagger
         *
         * /api/signup:
         *   post:
         *     description: Registers user to website.
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
         *       - auth
         *     responses:
         *       200: 
         *         description: Returns a success message and a login token as json.
         *       201:
         *         description: Retruns a error message as json.
         * 
         */
        
        server.app.post('/api/signup', api.signup);
        
        /**
         * @swagger
         *
         * /api/profile:
         *   post:
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
        server.app.post('/api/profile', api.profile);

        /**
         * @swagger
         *
         * /api/profile:
         *   post:
         *     description: checks if a username is taken.
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
        server.app.post('/api/user', api.username_taken);
        
        /**
         * @swagger
         *
         * /api/sign:
         *   post:
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
         *       - auth
         *     responses:
         *       200: 
         *         description: Returns a success message and taken boolean as json.
         * 
         */
        server.app.post('/api/sign', api.sign);
    }
}

module.exports = RestRoutes;
