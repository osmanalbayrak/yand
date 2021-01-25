const { Collection } = require("discord.js");
const { YandHandler } = require("../YandHandler");
const { YandError } = require("../Util/YandError");
const Discord = require("discord.js");
const { CommandHandlerUtil } = require("./CommandHandlerUtil");
const chalk = require("chalk");
const Util = require("util");
const { ListenerHandler } = require("../Listener/ListenerHandler");
const { PrefixManager } = require("./extras/PrefixManager");







class CommandHandler extends YandHandler {



  /**
   * @param {YandClient} client
   * @param {CommandHandlerOptions} [options = {}]
   */
  constructor(client, options = {}) {
    super(client);



    // Ayarları çekiyoruz.
    const {
      directory,
      prefix = ["."],
      allCommandCooldown = null,
      ignored = {
        channels: [],
        users: [],
        roles: [],
        guilds: []
      },
      permissions = [],
      tagPrefix
    } = options;

    this.prefixManager = new PrefixManager(this.client, prefix);

    // Komut dosyaları yoksa hata mesajı verdirtiyoruz.
    if (!directory) {
      throw new YandError(
        "Aranan klasör",
        "Lütfen komutların bulunduğu klasörü belirtiniz."
      );
    }



    // Komut dosyasını tanımlıyoruz.
    /**
     * @type {string}
     */
    this.directory = directory;



    // Komutların koleksiyonunu oluşturuyoruz.
    /**
     * @type {Collection<string,Command>}
     */
    this.commands = new Collection();



    // Klasik aliases.
    /**
     * @type {Collection<string,string>}
     */
    this.aliases = new Collection();


    
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



    /**
     * @type {ignoredOptions}
     */
    this.ignored = ignored;

    

    // Util classını tanımlıyoruz. (parseArgs kullanabilmek için.)
    /**
     * 
     * @type {CommandHandlerUtil}
     */
    this.util = new CommandHandlerUtil(this);



    // Komutların kategorilerini oluşturuyoruz. (default = varsayılan)
    /**
     * @type {Collection<string,Command[]>}
     */
    this.categories = new Collection();



    // Bütün kategorilerin isimlerini array şeklinde kaydettireceğiz.
    /**
     * @type {string[]}
     */

    this.allCategoryName = null;



    // Komutlarda listenerHandler classındaki eventlere erişmek için tanımlıyoruz. (kullanıcı isterse tanımlayabilir.)
    /**
     * @type {ListenerHandler}
     */
    this.listenerHandler = null;



    /**
     * @type {Collection<string,number>}
     */
    // rateLimit'e yakalanan kullanıcılar burda depolanacak.
    this.rateLimits = new Collection();
    
    



    // Bütün komutlar üzerindeki cooldown.
    /**
     * @type {number}
     */
    this.allCommandCooldown = allCommandCooldown;



    /**
     * @type {Discord.PermissionString | Discord.PermissionString[]}
     */
    this.permissions = permissions;



    if (!Array.isArray(this.permissions)) {
      this.permissions = [this.permissions];
    }


    /**
     * @type {boolean}
     */
    this.tagPrefix = tagPrefix;

  }



  /**
   *
   *
   * @returns {this}
   * @memberof CommandHandler
   */
  loadAllCommands() {
    // Komut dosyalarını çekiyoruz.
    const files = this.parseDirectoryFiles(this.directory);
    
    // Dosyaları döngüye alıyoruz.
    files.forEach(async (file) => {
      // Classı çağırıyoruz.
      const command = require(file);
      
      // Yeni class oluşturuyoruz.
      /**
       * @type {Command}
       */
      const cmd = new command();
      
      // Client'i tanımlıyoruz.
      this.client.on('ready', () => {
        cmd.client = this.client;
      });
      
      // Dosya yolunu tanımlıyoruz.
      cmd.path = file;
      
      // ListenerHandler classını tanımlıyoruz.
      cmd.listenerHandler = this.listenerHandler;
      
      // CommandHandler classını tanımlıyoruz.
      cmd.commandHandler = this;
      
      // Bütün komutları yükletiyoruz.
      await this.addCommand(cmd);
      
      // Komuttaki prefixleri ayrıştırıyoruz.
      this.prefixManager.commandPrefixAddToAllPrefix(cmd);
    });

    // Bot hazır olunca
    this.client.on("ready", () => {
      
      // Mesaj tetiklenince
      this.client.on("message", async (message) => {
        if (message.guild && !this.util.checkBotPermission(message, ["SEND_MESSAGES"], "channel", false)) {
          // @ts-ignore
          this.client.emit("debug", { message: "Botun mesaj gönderme yetkisi yok." });
          return this.emit("debug", { message: "Botun mesaj gönderme yetkisi yok." });
        }
        await this.prefixManager.init();
        // Eksik mesaj içerigi gelirse.
        if (message.partial) await message.fetch();
        
        // Komutu çalıştırıyoruz.
        this.handle(message);
      });
      
  
      this.client.on("messageUpdate", (oldMessage, newMessage) => {
        if (oldMessage.content === newMessage.content) return;
        // @ts-ignore
        this.handle(newMessage);
      });
    });
    
    return this;
  }



  /**
   *
   *
   * @param {Discord.Message} message
   * @returns {Promise<any>}
   * @memberof CommandHandler
   * 
   */
  async handle(message) {
    return new Promise(async (resolve) => {
      await this.prefixManager.handlePrefix(message);
      if (this.tagPrefix) {
        const mentioned = message.mentions.users.first();
        if (mentioned && mentioned.id === this.client.user.id) {
          if (message.content.endsWith(`<@${this.client.user.id}>`)) {
            const { prefixes, commandPrefixes } = this.prefixManager.allPrefix;
            const guildPrefixes = this.prefixManager.getGuildPrefixes(message.guild);
            const availablePrefixes = [...guildPrefixes, ...prefixes];
            return message.channel.send(`**Bu sunucuda kullanabileceğiniz prefixler:** __[ ${availablePrefixes.length > 0 ? availablePrefixes.join(" , ") : "Yok"} ]__\n**Komuta özel prefixlerim:** __[ ${commandPrefixes.length > 0 ? commandPrefixes.join(" , ") : "Yok"} ]__`)
              .then((msg) => msg.delete({ timeout: 60000 }));
          }
        }
      }
      // author content degişkenlerimizi oluşturduk.
      const { content, author, guild, channel } = message;
    
      // cooldown ve rateLimit'e yakalanma durumu için degişkenler.
      let cooldown;
      // Komut hangi prefixle başlıyorsa onu alıyoruz.
      const prefix = await this.prefixManager.getRealPrefix(message, this.commands);
      // Prefix yoksa return.
      if (!prefix) return;
      // Komutumuzu belirtiyoruz.
      const command = content.slice(prefix.length).split(" ")[0];
      
      // Komutu çağırıyoruz.
      let cmd = this.commands.get(command);
      // Aliaseslerde varsa.
      if (!cmd && this.aliases.has(command)) {
        cmd = this.commands.get(this.aliases.get(command));
      }
      
      // Komut yoksa return.
      if (!cmd) return;
      
      // Guild verisini gönderiyoruz.
      cmd.guild = guild;
      
      // Channel verisini gönderiyoruz.
      cmd.channel = channel;
      
      // Botun yetkini kontrol ettireceğiz
      if (cmd.botPermissions.guildOrChannel) {
        if (cmd.botPermissions.permissions[0]) {
          cmd.botPermissions.permissions = this.prefixManager.deleteRepeatedItem(cmd.botPermissions.permissions);
        }
        if (cmd.botPermissions.guildOrChannel === "guild") {
          const checkPerm = this.util.checkBotPermission(message, cmd.botPermissions.permissions, "guild", true);
          if (!checkPerm) return;
        } else if (cmd.botPermissions.guildOrChannel === "channel") {
          if (typeof cmd.botPermissions.channel !== "function") {
            throw new YandError("Tip hatası", `${cmd.id} ID'li komut da botPermissions bölümünde channel property'si function olmak zorundadır.`);
          }
          const channel = cmd.botPermissions.channel(message);
          if (!(channel instanceof Discord.GuildChannel)) {
            throw new YandError("Tip hatası", `${cmd.id} ID'li komut da botPermissions bölümündeki channel fonksiyonu GuildChannel class'ı dönmek zorundadır.`);
            return;
          }
          const checkPerm = this.util.checkBotPermission(message, cmd.botPermissions.permissions, "channel", true, channel);
          if (!checkPerm) return;
          
        } else {

        }
      }

      // Eğer engele takılırsa return. (yasaklı kanal yasaklı üye vb vb..)
      if (this.util.noObstacle(cmd, message)) return;
    
      // Eğer event gerçekleşirse return.
      if (this.allCommandCooldown && !cmd.importantCooldown) cmd.cooldown = this.allCommandCooldown < 1000 ? this.allCommandCooldown * 1000 : this.allCommandCooldown;
    
      // Eventi başlatıcak method.
      if (cmd.cooldown) {
        const getCaught = this.util.checkRateLimit(author.id, cmd, message);
        if (getCaught) return;
      }
      // Args'ı ayrıştırıyoruz.
      let args = await this.util.parseArgs(cmd.args, message, prefix, cmd);
      if (!Array.isArray(args) && args.size < 1) args = null;
      if (Array.isArray(args) && args.length < 1) args = null;
      // Komut asenkron ise await ile kullanıyoruz ne olur ne olmaz.
      if (this.client.util.isPromise(cmd.exec)) {
        this.client.emit("commandStart", message, cmd, args);
        this.emit("commandStart", message, cmd, args);
        await cmd.exec(message, args);
        this.client.emit("commandEnd", message, cmd, args);
        this.emit("commandEnd", message, cmd, args);
        resolve();
      } else {
        this.client.emit("commandStart", message, cmd, args);
        this.emit("commandStart", message, cmd, args);
        // Komutu normal çalıştırıyoruz.
        cmd.exec(message, args);
        this.client.emit("commandEnd", message, cmd, args);
        this.emit("commandEnd", message, cmd, args);
        resolve();
      }
    });
  }


  

  /**
   *
   *
   * @param {string} id
   * @returns {Promise<Command>}
   * @memberof CommandHandler
   */
  reloadCommand(id) {
    return new Promise(async (resolve) => {
     
      // Komutu getirtiyoruz.
      const command = this.commands.get(id);
     
      // Eğer komut yok ise hata mesajı attırıyoruz
      if (!command) {
        throw new YandError("Aranan komut", "Böyle bir komut yok güncelliyemiyorum.");
      }
     
      // Modülü global require.cache objesinin içinde require.resolve fonksiyonuna komutun path verisini vererek sildirtiyoruz. (path burda işe yarıyor işte.)
      delete require.cache[require.resolve(command.path)];
      try {
     
        // Komutu yeniden require ile çagırıyoruz.
        let reloadedCommand = require(command.path);
           
        // Yeni bir komut klası oluşturuyoruz. içindekı özellikler degişti ise zaten onlara göre class yeniden oluşuyor buda yenilendi demektir.
        /**
         * @type {Command}
         */
        const reloadedCmd = new reloadedCommand();
       
        // Komutun commandHandlerini vermemiz lazım yoksa undefined olucaktır.
        reloadedCmd.commandHandler = this;
       
        // Aynı şekil listenerHandler içinde geçerli.
        reloadedCmd.listenerHandler = this.listenerHandler;
       
        // Eğer path verisini vermez isek komutu 2. defa yeniledigimizde path undefined olucaktır ve require ile geri çekemiyeceğiz.
        reloadedCmd.path = command.path;
       
        // Komutu siliyoruz.
        this.commands.delete(id);
       
        // Yeni komutu ekliyoruz
        this.commands.set(id, reloadedCmd);
        this.client.emit("reloadCommand", command);
        this.emit("reloadCommand", command);
        this.client.emit("updateCommand", command, reloadedCmd);
        this.emit("updateCommand", command, reloadedCmd);
       
        // Komutun geri döndürüyoruz.
        resolve(reloadedCmd);
      } catch (e) {
      
        // Eğer olurda bir hata olursa hatayı yansıtsın.
        throw new YandError("Komut güncellenemedi", e);
      }
    });
  }



  /**
   *
   * @returns {Promise<void>}
   * @memberof CommandHandler
   */
  reloadAllCommand() {
    return new Promise((resolve) => {
      
      // Bütün komutları döngüye alıyoruz.
      this.commands.forEach(async (command) => {
      
        // Komutu reload ediyoruz.
        const reloaded = await this.reloadCommand(command.id);
      
        // Bütün komutların kategorilerini siliyoruz.
        await this.deleteAllCategory();
      
        // Ve yeniden bütün kategorileri oluşturuyoruz.
        // Burda reloaded parametresini verme sebebim eğer komutun kategorisi değişti ise ona göre bütün kategorileri yüklicek.
        this.loadCategory(reloaded);
      });
      
      // Bütün kategorileri yükledigimizde CommandHandleri emit ediyoruz.
      this.client.emit("reloadAllCommand", this.commands);
      this.emit("reloadAllCommand", this.commands);
      resolve();
    });
  }



  /**
   *
   *
   * @param {Command} command
   * @returns {Promise<void>}
   * @memberof CommandHandler
   * 
   */
  loadCategory(command) {
    return new Promise((resolve) => {
      
      // Eğer parametre olarak gelen komutun kategorisi yoksa demekki yeni bir kategori oluşmuş demektir.
      if (!this.categories.has(command.category)) {
      
        // Yeni kategori oluşturuyoruz ve array değerini veriyoruz.
        this.categories.set(command.category, []);
      }
      
      // Eğer komutun kategorisi varsa
      if (this.categories.has(command.category)) {
      
        // Komutun kategorisindeki verileri getirtiyoruz.
        const categoryCollection = this.categories.get(command.category);
      
        // Komutu kategoriye pushluyoruz.
        categoryCollection.push(command);
      
        // Kategori koleksiyonuna komutun kategorisini veriyoruz ve 2 parametre olarak da o kategoriye ait komutları veriyoruz.
        this.categories.set(command.category, categoryCollection);
      }
      
      // Bütün kategorilerimizi allCategoryName degişkenine atıyoruz.
      this.allCategoryName = [...this.categories.keyArray()];
      resolve();
    });
  }



  /**
   *
   * @returns {Promise<void>}
   * @memberof CommandHandler
   */
  deleteAllCategory() {
    return new Promise(async (resolve) => {
      
      // Kategori koleksiyonun kategori isimlerini alıyoruz.
      for (const category of this.categories.keyArray()) {
      
        // Ve hepsini siliyoruz.
        this.categories.delete(category);
      }
      resolve();
    });
  }


  
  /**
   *
   *
   * @param {string} id
   * @returns {Promise<this>}
   * @memberof CommandHandler
   */
  deleteCommand(id) {
    return new Promise((resolve) => {
  
      // Komutu getiriyoruz.
      const command = this.commands.get(id);
  
      // Komut yoksa hata var.
      if (!command) {
        throw new YandError("Komut Yok", "Silinecek komut bulunamadı.");
      }
  
      // Komut varsa silinicek.
      delete require.cache[require.resolve(command.path)];
      try {
  
        // Silindi.
        this.commands.delete(id);
        this.client.emit("deleteCommand", command);
        this.emit("deleteCommand", command);
        this.client.emit("updateCommandList", this.commands);
        this.emit("updateCommandList", this.commands);
        resolve(this);
      } catch (e) {
  
        // Hata olursa bildireceğiz.
        throw new YandError("Komut silinemedi", e);
      }
    });
  }


  /**
   *
   *
   * @param {Command} command
   * @return {Promise<boolean>}
   * @memberof CommandHandler
   */
  addCommand(command) {
    return new Promise(async (resolve) => {
     
      // Komut birden fazla aynı isimde ise hata vericek.
      if (this.commands.has(command.id)) {
        throw new YandError("Tekrarlanan komut", `Bir komuttan 2 adet var. Hata ${command.path} dosyasından kaynaklanıyor.`);
      }
     
      // Yeni komut ekletiyoruz.
      this.commands.set(command.id, command);
     
      // Komutun aliaseslerini koleksiyona ekletiyoruz.
      await this.addAliases(command.aliases, command.id);
      // Komutu kategorisine ekliyoruz.
      await this.loadCategory(command);
      resolve(true);
    });
  }


  /**
   *
   *
   * @param {string[]} aliases
   * @param {string} commandName
   * @returns {Promise<boolean>}
   * @memberof CommandHandler
   */
  addAliases(aliases, commandName) {
    return new Promise((resolve) => {
      
      // Aliasesleri döngüte alıyoruz.
      aliases.forEach(async (alias) => {
      
        // Koleksiyona ekliyoruz.
        await this.aliases.set(alias, commandName);
      });
      resolve(true);
    });
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


  /**
   *
   *
   * @param {ListenerHandler} handler
   * @returns {this}
   * @memberof CommandHandler
   */
  setHandler(handler) {
    if (!(handler instanceof ListenerHandler)) {
      throw new YandError("Tip hatası", "Parametre olarak ListenerHandler classı alabilir.");
    }
    this.listenerHandler = handler;
    return this;
  }
}


 

module.exports = {
  CommandHandler
};





/**
 * @typedef {Object} CommandHandlerOptions
 * @prop {string} [directory]
 * @prop {string[] | Function} [prefix]
 * @prop {ignoredOptions} [ignored]
 * @prop {number} [allCommandCooldown]
 * @prop {Discord.PermissionString | Discord.PermissionString[]} [permissions]
 * @prop {boolean} [tagPrefix]
 */

/**
 * @typedef {Object} ignoredOptions
 * @prop {Discord.Snowflake[] | Discord.Snowflake} [guilds]
 * @prop {Discord.Snowflake[] | Discord.Snowflake} [users]
 * @prop {Discord.Snowflake[] | Discord.Snowflake} [roles]
 * @prop {Discord.Snowflake[] | Discord.Snowflake} [channels]
 
 */


/**
 * @typedef {import("../YandClient")._YandClient} YandClient
 */


/**
 * @typedef {import("./Command")._Command} Command
 */



/**
 * @typedef {CommandHandler} _CommandHandler
 */



/**
 * @typedef {import("../Listener/ListenerHandler")._ListenerHandler} ListenerHandler
 */


 