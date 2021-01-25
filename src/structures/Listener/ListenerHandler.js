const { YandHandler } = require("../YandHandler");
const { YandClient } = require("../YandClient");
const { YandError } = require("../Util/YandError");
const { Listener } = require("./Listener");















class ListenerHandler extends YandHandler {
  
  
  
  /**
   * Creates an instance of ListenerHandler.
   * @param {YandClient} client
   * @param {ListenerHandlerOptions} [options={}]
   * @memberof ListenerHandler
   */
  constructor(client, options) {
    super(client);
    const { directory } = options;

    if (!directory) {
      throw new YandError(
        "Aranan klasör",
        "Lütfen dinleyicilerin olacağı klasörü belirtiniz."
      );
    }

    /**
     * @type {string}
     */
    this.directory = directory;

    /**
     * @type {CommandHandler}
     */
    this.commandHandler = null;
  }



  /**
   *
   * @returns {this}
   * @memberof ListenerHandler
   */
  loadAllListener() {
    this.client.on("ready", () => {
      const files = this.parseDirectoryFiles(this.directory);
      files.forEach((file) => {
        const command = require(file);
         /**
         * @type {Listener}
         */
        const cmd = new command();
        cmd.client = this.client;
        if (cmd.event === "ready") {
          return cmd.exec();
        }
        if (cmd.emitter === "Bot") {
          // @ts-ignore
          this.client.on(cmd.event, (...args) => {
            cmd.exec(...args);
          });
        }
        if (cmd.emitter === "YandClient") {
          if (!this.commandHandler) {
            throw new YandError("Tanımlanmamış değer");
          } else {
            this.commandHandler.on(cmd.event, (...args) => {
              cmd.exec(...args);
            });
            this.on(cmd.event, (...args) => {
              cmd.exec(...args);
            });
          }
        }
      });
    });
    return this;
  }



  /**
   *
   *
   * @memberof ListenerHandler
   */
  loadCustomEvent() {
    this.client.on("guildMemberAdd", async (member) => {
      const { guild } = member;
      const audit = await guild.fetchAuditLogs();
      const action = audit.entries.first().action;
      if (action === "BOT_ADD") {
        const { executor, target } = audit.entries.first();
        this.client.emit('guildBotAdd', guild, executor, target);
        this.emit("guildBotAdd", guild, executor, target);
      }
    });
  }



  /**
   *
   *
   * @param {CommandHandler} handler
   * @returns {this}
   * @memberof ListenerHandler
   */
  setHandler(handler) {
    this.commandHandler = handler;
    return this;
  }


  
  /**
   *
   *
   * @param {string} key
   * @param {any} value
   * @returns {this}  
   * @memberof CommandHandler
   */
  setPrototype(key, value) {
    if (this[key]) throw new YandError("Kural dışı", "Olan özellikleri değiştiremezsin.");
    this[key] = value;
    return this;
  }
}




module.exports = {
    ListenerHandler
};







/**
 * @typedef {Object} ListenerHandlerOptions
 * @prop {string} directory
 */




/**
 * @typedef {import("../Command/CommandHandler")._CommandHandler} CommandHandler
 */




/**
 * @typedef {ListenerHandler} _ListenerHandler
 */
