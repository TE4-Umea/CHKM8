class SwaggerRoutes {
    constructor(server) {
        
        /**
         * @swagger
         *
         * /login:
         *   get:
         *     description: Get the Swagger json file
         *     produces:
         *       - application/json
         *     parameters:
         *     responses:
         *       200:
         *         description: Json file containing OpenAPI compliant Api routes
         */
        server.app.get('/docs/swagger.json', async (req, res) => {
            new (require('../controllers/SwaggerController'))().fetch(
                req,
                res
            );
        });
    }
}

module.exports = SwaggerRoutes;
