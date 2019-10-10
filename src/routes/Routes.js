/**
 * Declares all the Routes and passes the needed arguments to them.
 */
class Routes {
    /**
     * Constructor for initiating the different routes files.
     * @param {Server} server 
     */
    constructor(server) {
        // Enable PUG rendering in the express app
        server.app.set('view engine', 'pug');

        // Inline declaration of RestRoutes Object and the running constructor.
        new (require('./RestRoutes'))(server);

        new (require('./WebsiteRoutes'))(server);

        new (require('./WebhookRoutes'))(server);

        new (require('./SlackRoutes'))(server);

        new (require('./SwaggerRoutes'))(server);
    }
}

module.exports = Routes;
