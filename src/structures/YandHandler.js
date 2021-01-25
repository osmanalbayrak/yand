const fs = require("fs");
const path = require("path");
const { EventEmitter } = require("events");







class YandHandler extends EventEmitter {
    /**
     * Creates an instance of YandHandler.
     * @param {YandClient} client
     * @memberof YandHandler
     */
    constructor(client) {
        super();
        /**
         * @type {YandClient}
         */
        this.client = client;
    }

    /**
     *
     *
     * @param {string} directory
     * @returns {string[]}
     * @memberof YandHandler
     */
    parseDirectoryFiles(directory) {
        const result = [];
        function repeat(dir) {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const filePath = path.resolve(path.join(dir, file));
                if (fs.statSync(filePath).isDirectory()) {
                    repeat(filePath);
                } else {
                    result.push(filePath);
                }
            }
        }
        repeat(directory);
        return result;
    }

    
}



/**
 * @typedef {import("./YandClient")._YandClient} YandClient
 */





module.exports = {
    YandHandler
};