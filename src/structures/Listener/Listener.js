const { YandClient } = require("../YandClient");
const { YandError } = require("../Util/YandError");
const Discord = require("discord.js");
















class Listener {

    


    /**
     * Creates an instance of Listener.
     * @abstract
     * @param {ListenerOptions} [options = {}]
     * @memberof Listener
     */
    constructor({
        event,
        emitter
    } = { emitter: "Bot" }) {

        /**
         * @type {YandClient}
         */
        this.client = null;

        if (!event) throw new YandError("Aranan event", "Event ismi belirtilmemiş.");
        
        /**
         * @type {YandEvents}
         */
        this.event = event;

        /**
         * @type {"Bot" | "YandClient"}
         */
        this.emitter = emitter;

        /**
         * @type {YandClient}
         */
        this.client = null;

    }


    
    /**
     *
     * @abstract
     * @param {any[]} args
     * @memberof Listener
     */
    exec(...args) {
        throw new YandError("abstract class", "Bu class sadece miras alınabilir.");
    }
}





module.exports = {
    Listener
};




/**
 * @typedef {Object} ListenerOptions
 * @prop {YandEvents} [event]
 * @prop {"Bot" | "YandClient"} [emitter]
 */




/**
 * @typedef {keyof Discord.ClientEvents} DiscordjsEvents
 */


/**
 * @typedef {DiscordjsEvents | keyof CommandHandlerEvents} YandEvents
 */


/**
 * @typedef {Object} CommandHandlerEvents
 * @prop {string} rateLimitCaught
 * @prop {string} commandStart
 * @prop {string} commandEnd
 * @prop {string} deleteCommand
 * @prop {string} updateCommandList
 * @prop {string} reloadAllCommand
 * @prop {string} reloadCommand
 * @prop {string} updateCommand
 * @prop {string} guildBotAdd
 */
