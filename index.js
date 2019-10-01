var ConfigLoader = require("./ConfigLoader")
    ConfigLoader = new ConfigLoader()

const Server = require("./Server")
const server = new Server(ConfigLoader.load())