const Discord = require("discord.js");
const { YandError } = require("../Util/YandError");
const path = require("path");
const chalk = require("chalk");
const { Collection } = require("discord.js");
const {
  GuildChannel,
  Role,
  User,
  GuildMember,
  MessageEmbed,
  MessageAttachment
} = require("discord.js");






class Command {





  /**
   * @param {CommandOptions} [options]
   * @param {string} id
   */
  constructor(id, options = {}) {
    const {
      aliases = [],
      cooldown = null,
      ownerOnly = false,
      guildOnly = false,
      prefix = [],
      category = "varsayılan",
      description = "",
      args = [],
      ignored = {
        bots: true,
        users: [],
        channels: [],
        guilds: [],
        roles: []
      },
      permissions = [],
      importantCooldown = false,
      argsType = "betterArgs",
      argsCancelMessage = "iptal",
      argsSkipMessage = "geç",
      botPermissions = {
        guildOrChannel: null,
        permissions:[]
      }
    } = options;



    this.id = id;



    /**
     * @type {string[]}
     */
    this.aliases = aliases;



    /**
     * @type {number}
     */
    this.cooldown = cooldown;



    /**
     * @type {boolean}
     */
    this.ownerOnly = ownerOnly;



    /**
     * @type {boolean}
     */
    this.guildOnly = guildOnly;


   
    /**
     * @type {string[]}
     */
    this.prefix = prefix;



    /**
     * @type {string}
     */
    this.category = category;



    /**
     * @type {string}
     */
    this.description = description;



    /**
     * @type {any}
     */
    this.channel = null;



    /**
     * @type {YandClient}
     */
    this.client = null;



    /**
     * @type {Discord.Guild}
     */
    this.guild = null;



    /**
     * @type {argsOptions[]}
     */
    this.args = args;

    

    if (!Array.isArray(permissions)) {
      Object.defineProperty(ignored, "perm", {
        value: [permissions]
      });
    }



    /**
     * @type {Discord.PermissionString | Discord.PermissionString[]}
     */
    this.permissions = permissions;
    


    if (!Array.isArray(ignored.users) && ignored.users) {
      ignored.users = [ignored.users];
    }



    if (!Array.isArray(ignored.roles) && ignored.roles) {
      ignored.roles = [ignored.roles];
    }



    if (!Array.isArray(ignored.channels) && ignored.channels) {
      ignored.channels = [ignored.channels];
    }



    if (!Array.isArray(ignored.guilds) && ignored.guilds) {
      ignored.guilds = [ignored.guilds];
    }



    if (!ignored.guilds) {
      ignored.guilds = [];
    }



    if (!ignored.roles) {
      ignored.roles = [];
    }



    if (!ignored.channels) {
      ignored.channels = [];
    }



    if (!ignored.users) {
      ignored.users = [];
    }

    

    /**
     * @type {ignoredOptions}
     */
    this.ignored = ignored;



    /**
     * @type {string}
     */
    this.path = null;


    
    /**
     * @type {ListenerHandler}
     */
    this.listenerHandler = null;



    /**
     * @type {CommandHandler}
     */
    this.commandHandler = null;



    /**
     * @type {boolean}
     */
    this.importantCooldown = importantCooldown;



    /**
     * @type {typeof MessageEmbed}
     */
    this.MessageEmbed = MessageEmbed;



    /**
     * @type {typeof MessageAttachment}
     */
    this.MessageAttachment = MessageAttachment;
  
  
    // Args tipi.
    /**@type {"defaultArgs" | "betterArgs"} */
    this.argsType = argsType;

    // Args sistemini geçmesi için gereken mesaj.
    /**@type {string} */
    this.argsSkipMessage = argsSkipMessage;

    // Args sistemini iptal etmek için gereken mesaj.
    /**@type {string} */
    this.argsCancelMessage = argsCancelMessage;

    // Botun yetkileri burda belirtilicek.
    /**@type {BotPermissionsOptions} */
    this.botPermissions = botPermissions;
  }




  /**
   *
   * @abstract
   * @param {...any} args
   * @returns {any}
   * @memberof Command
   */
  exec(...args) {
    throw new YandError("abstract class", "Bu class sadece miras alınabilir.");
  }
}





module.exports = {
    Command
};






/**
 * @typedef {User | GuildMember | GuildChannel | Role | string | string[] | number | number[]} returnedArgsType
 */

/**
 * @typedef {Object} CommandOptions
 * @prop {string[]} [prefix = []]
 * @prop {string[]} [aliases = []]
 * @prop {number} [cooldown]
 * @prop {boolean} [importantCooldown]
 * @prop {boolean} [ownerOnly]
 * @prop {boolean} [guildOnly]
 * @prop {string} [category]
 * @prop {string} [description]
 * @prop {argsOptions[]} [args]
 * @prop {ignoredOptions} [ignored]
 * @prop {"defaultArgs" | "betterArgs"} [argsType]
 * @prop {string} [argsCancelMessage = "iptal"]
 * @prop {string} [argsSkipMessage = "skip"]
 * @prop {Discord.PermissionString | Discord.PermissionString[]} [permissions]
 * @prop {BotPermissionsOptions} [botPermissions]
 */ 


/**
 * @typedef {Object} ignoredOptions
 * @prop {Discord.Snowflake[] | Discord.Snowflake} [guilds]
 * @prop {Discord.Snowflake[] | Discord.Snowflake} [users]
 * @prop {Discord.Snowflake[] | Discord.Snowflake} [roles]
 * @prop {Discord.Snowflake[] | Discord.Snowflake} [channels]
 * @prop {boolean} [bots=true]
 */
/**
 * @typedef {Object} argsOptions
 * @prop {"user" | "member" | "channel" | "role" | "yazı"} tip
 * @prop {string} anahtar
 * @prop {string} soru
 * @prop {boolean} [def]
 */



/**
 * @typedef {import("../YandClient")._YandClient} YandClient
 */


/**
 * @typedef {Command} _Command
 */




/**
 * @typedef {import("../Listener/ListenerHandler")._ListenerHandler} ListenerHandler
 */



/**
 * @typedef {import("./CommandHandler")._CommandHandler} CommandHandler 
 */



/**
 * @typedef {Object} BotPermissionsOptions
 * @prop {"channel" | "guild"} guildOrChannel
 * @prop {Discord.PermissionString[]} permissions
 * @prop {Function} [channel]
 */