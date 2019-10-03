class WebsiteRoutes {
    constructor(server) {
        /* Website pages */

        /**
         * @swagger
         *
         * /dashboard:
         *   get:
         *     description: Dashboard / main page
         *     produces:
         *       - application/ text/html
         *
         *     responses:
         *       200:
         *         description: Returns dashboard page
         */
        server.app.get('/dashboard', (req, res) => {
            res.render('dashboard', {
                client_id: server.config.client_id,
            });
        });

        /**
         * @swagger
         *
         * /login:
         *   get:
         *     description: Login page.
         *     produces:
         *       - application/ text/html
         *
         *     responses:
         *       200:
         *         description: Returns Login/Signup page.
         */
        server.app.get('/login', (req, res) => {
            res.render('login');
        });
        /**
         * @swagger
         *
         * /docs:
         *   get:
         *     description: Documentation site.
         *     produces:
         *       - application/ text/html
         *
         *     responses:
         *       200:
         *         description: Returns Documentation page.
         */

        server.app.get('/docs', (req, res) => {
            res.end('Docs is being remade');
        });
        /**
         * @swagger
         *
         * /edit:
         *   get:
         *     description: Edit page
         *     produces:
         *       - application/ text/html
         *
         *     responses:
         *       200:
         *         description: Returns edit page
         */

        server.app.get('/edit', (req, res) => {
            res.render('edit');
        });
        /**
         * @swagger
         *
         * /index:
         *   get:
         *     description: Index page
         *     produces:
         *       - application/ text/html
         *
         *     responses:
         *       200:
         *         description: Returns index.html
         */
        server.app.get('/', (req, res) => {
            res.render('index');
        });
    }
}

module.exports = WebsiteRoutes;
