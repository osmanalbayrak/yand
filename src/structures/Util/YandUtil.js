const Discord = require("discord.js");






/**
 *
 *
 * @class YandUtil
 */
class YandUtil {
    /**
     * Creates an instance of YandUtil.
     * @param {YandClient} client
     * @memberof YandUtil
     */
    constructor(client) {
        this.client = client;
    }


    /**
     *
     *
     * @param {Function} func
     * @returns {boolean}
     * @memberof YandUtil
     */
    isPromise(func) {
        if (func[Symbol.toStringTag] === "AsyncFunction") return true;
        return false;
    }
}


module.exports = {
    YandUtil
};








/**
 * @typedef {import("../YandClient")._YandClient} YandClient
 */
