var ConfigLoader = require('./ConfigLoader');
ConfigLoader = new ConfigLoader();

const Server = require('./Server');
new Server(ConfigLoader.load());