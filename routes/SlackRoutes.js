class SlackRoutes {
    constructor(server) {
        var slack_controller = new (require('../controllers/SlackApiController'))(server);
        
        /**
         * @swagger
         *
         * /auth:
         *   get:
         *     description: Returns the slack authentication view.
         *     produces:
         *       - text/html
         *     tags:
         *       - slack
         *     responses:
         *       200:
         *         description: Html view of the slack authentication page.
         */
        server.app.get('/auth', slack_controller.auth);

        /**
         * @swagger
         *
         * /api/slack/checkin:
         *   post:
         *     description: Check in the slack user
         *     produces:
         *       - application/json
         *     parameters:
         *       - in: formData
         *         name: userid
         *         schema: 
         *           type: integer
         *         description: Id from the user
         *         required: false
         * 
         *       - in: formData
         *         name: project
         *         schema: 
         *           type: string
         *         description: Project to check in and track time at
         *         required: false
         *     tags:
         *       - slack
         *     responses:
         *       200:
         *         description: Checks in the user in specified project
         */
        server.app.post('/api/slack/checkin', slack_controller.check_in);

        /**
         * @swagger
         *
         * /api/slack/checkout:
         *   post:
         *     description: Check out the user
         *     produces:
         *       - application/json
         *     parameters:
         *       - in: formData
         *         name: userid
         *         schema: 
         *           type: integer
         *         description: Id from the user
         *         required: true
         *     tags:
         *       - slack
         *     responses:
         *       200:
         *         description: Checks out from the current project and time tracking
         */
        server.app.post('/api/slack/checkout', slack_controller.check_out);
        
        /**
         * @swagger
         *
         * /api/slack/remove:
         *   post:
         *     description: Removes user from specified project.
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
         *       - slack
         *     responses:
         *       200:
         *         description: Json with check in or out success and a text message.
         *       201:
         *         description: Json with error message.
         */
        server.app.post('/api/slack/remove', slack_controller.remove);

        /**
         * @swagger
         *
         * /api/slack/add:
         *   post:
         *     description: Add user to a project
         *     produces:
         *       - application/json
         *     parameters:
         *       - in: formData
         *         name: User
         *         schema: 
         *           type: string
         *         description: User to add to the project
         *         required: true
         * 
         *       - in: formData
         *         name: Project
         *         schema: 
         *           type: integer
         *         description: Project to add user to
         *         required: true
         * 
         *       - in: formData
         *         name: User
         *         schema: 
         *           type: string
         *         description: User that ran the command
         *         required: true
         *     tags:
         *       - slack
         *     responses:
         *       200:
         *         description: Add the specified user to the specified project
         */
        server.app.post('/api/slack/add', slack_controller.add);
        
        /**
         * @swagger
         *
         * /api/slack/new:
         *   post:
         *     description: Create a new project
         *     produces:
         *       - application/json
         *     parameters:
         *       - in: formData
         *         name: project_name
         *         schema: 
         *           type: string
         *         description: The name of the project.
         * 
         *       - in: formData
         *         name: user
         *         schema: 
         *           type: string
         *         description: User that creates the project
         *     tags:
         *       - slack
         *     responses:
         *       200:
         *         description: Creates a new project with the specified name
         */

        server.app.post('/api/slack/new', slack_controller.new_project);

        /**
         * @swagger
         *
         * /api/slack/help:
         *   post:
         *     description: Shows help menu
         *     produces:
         *       - application/json
         *     tags:
         *       - slack
         *     responses:
         *       200:
         *         description: Loads a help menu using the commands.md file and reads it using utf-8
         */
        server.app.post('/api/slack/help', slack_controller.help);

        /**
         * @swagger
         *
         * /api/slack/delete:
         *   post:
         *     description: Delete a project
         *     produces:
         *       - application/json
         *     parameters:
         *       - in: formData
         *         name: Project_to_delete
         *         schema: 
         *           type: string
         *         description: Project to delete
         *         required: true
         * 
         *       - in: formData
         *         name: User
         *         schema: 
         *           type: integer
         *         description: ID of  the user to authenticate that they are an owner.
         *         required: true
         *     tags:
         *       - slack
         *     responses:
         *       200:
         *         description: Deletes specified project
         */
        server.app.post('/api/slack/delete', slack_controller.delete_project);

        /**
         * @swagger
         *
         * /api/slack/project:
         *   post:
         *     description: List all projects and get info about specified
         *     produces:
         *       - application/json
         *     parameters:
         *       - in: formData
         *         name: Project
         *         schema: 
         *           type: string
         *         description: Project to get info from
         *         required: false
         *     tags:
         *       - slack
         *     responses:
         *       200:
         *         description: List of projects with owners
         */
        server.app.post('/api/slack/project', slack_controller.project);
    }
}

module.exports = SlackRoutes;
