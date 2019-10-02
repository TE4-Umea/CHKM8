class SwaggerRoutes {
    constructor(server) {
        server.app.get('/docs/swagger.json', async (req, res) => {
            new (require('../controllers/SwaggerController'))(server).fetch(
                req,
                res
            );
        });
    }
}

module.exports = SwaggerRoutes;
