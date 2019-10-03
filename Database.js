/**
 * Async database model for mysql in node
 */

class Database {

    constructor(config){
        this.config = config
        this.mysql = require("mysql")
    }
    /**
     * Create a new mysql connection
     * ! Make sure to destroy it after or it will cause a crash
     */
    create_connection() {
        
        return this.mysql.createConnection({
            host: this.config.mysql_host,
            user: this.config.mysql_user,
            password: this.config.mysql_pass,
            database: this.config.database
        })
    }

    /**
     * Normal SQL query but promise based
     * @param {*} sql query
     * @param {*} args possible arguments
     */
    query(sql, args) {
        // Connect to mysql
        var con = this.create_connection()

        return new Promise((resolve, reject) => {
            con.query(sql, args, (err, rows) => {
                con.destroy()
                if (err) return reject(err);
                resolve(rows);
            })
        })
    }
    /**
     * SELECT only one item
     * @param {*} sql query
     * @param {*} args possible arguments
     */
    query_one(sql, args) {
        return new Promise((resolve, reject) => {
            /* Connect to the database */
            var con = this.create_connection()

            con.query(sql, args, (err, rows) => {
                con.destroy()
                if (err) return reject(err);
                resolve(rows[0])
            })
        })
    }
}

module.exports = Database