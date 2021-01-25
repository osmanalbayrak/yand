const { Client } = require("discord.js");
const Discord = require("discord.js");
const { YandUtil } = require("./Util/YandUtil");














class YandClient extends Client {

  




  /**
   * Creates an instance of YandClient.
   * @param {_YandOptions} [YandOptions]
   * @param {Discord.ClientOptions} [ClientOptions]
   * @memberof YandClient
   */
  constructor(YandOptions = {}, ClientOptions) {
    super(ClientOptions);

    const { owners = "" } = YandOptions;
    /**
     * @type {Discord.Snowflake | Discord.Snowflake[]}
     */
    this.owners = owners;
    this.util = new YandUtil(this);
  }





  /**
   * ID'si belirtilen kullanıcının botun sahiplerinden birisi olup olmadığını döndürür.
   * @param {Discord.UserResolvable} user
   * @returns {boolean}
   * @memberof YandClient
   * @example YandClient.isOwner("467915130743554059"); // return true or false
   */
  isOwner(user) {
    const id = this.users.resolveID(user);
    return Array.isArray(this.owners)
      ? this.owners.includes(id)
      : this.owners === id;
  }
}





module.exports = {
    YandClient
};



/**
 * @typedef {Object} _YandOptions
 * @prop {Discord.Snowflake[] | Discord.Snowflake} [owners]
 */


/**
 * @typedef {YandClient} _YandClient
 */
