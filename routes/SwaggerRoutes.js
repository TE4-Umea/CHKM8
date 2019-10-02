class SwaggerRoutes {
    constructor(server) {
        const swaggerJSDoc = require('swagger-jsdoc');

        const options = {
            definition: {
                openapi: '3.0.0', // Specification (optional, defaults to swagger: '2.0')
                info: {
                    title: 'Checkmate',
                    version: '1.0.0', // Version (required)
                },
            },
            // Path to the API docs
            apis: ['./routes.js'],
        };

        // Initialize swagger-jsdoc -> returns validated swagger spec in json format
        const swaggerSpec = swaggerJSDoc(options);
        server.app.get('/api-docs.json', (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(swaggerSpec);
        });
    }
}
