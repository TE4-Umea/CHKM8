class Website {
    constructor(server) {
        /* Website pages */
        server.app.get('/dashboard', (req, res) => {
            res.render('dashboard', {
                client_id: server.config.client_id,
            });
        });

        server.app.get('/login', (req, res) => {
            res.render('login');
        });

        server.app.get('/docs', (req, res) => {
            res.end('Docs is being remade');
        });

        server.app.get('/edit', (req, res) => {
            res.render('edit');
        });

        server.app.get('/', (req, res) => {
            res.render('index');
        });
    }
}

module.exports = Website;
