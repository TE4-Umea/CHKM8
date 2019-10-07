class Debug {
    
    /**
     * Log message with timestamp
     * Use this when a log should stay in the code
     * @param {*} message
     */
    log(message) {
        /**  Dont display messages if it's in a test */
        if (typeof global.it === 'function') return;
        /**  Create timestamp */
        var date = new Date();
        /**  Display message with timestamp */
        console.log(
            `[${date.getDate()}/${date.getMonth() +
                1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}] ${message}`
        );
    }
}

module.exports = Debug;