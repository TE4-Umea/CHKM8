class SwaggerController {
    constructor() {
        const swaggerJSDoc = require('swagger-jsdoc');

        const options = {
            definition: {
                openapi: '3.0.0', // Specification (optional, defaults to swagger: '2.0')
                info: {
                    title: 'Checkmate',
                    version: '1.0.0', // Version (required)
                },
            },
            apis: ['/routes/RestRoutes.js'],
        };
        var glob = require('glob');
        console.log(glob(options));
        // Initialize swagger-jsdoc -> returns validated swagger spec in json format
        this.swaggerJson = swaggerJSDoc(options);
    }
    async fetch(req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.send(this.swaggerJson);
    }
}

module.exports = SwaggerController;
