const Discord = require("discord.js");
const {
    Collection,
    MessageEmbed,
    User,
    Role,
    GuildMember,
    GuildChannel,
    Permissions
} = require("discord.js");
const ms = require("ms");
const { Perms } = require("./extras/Permissions");









class CommandHandlerUtil {




  /**
   * Creates an instance of CommandHandlerUtil.
   * @param {CommandHandler} commandHandler
   * @memberof CommandHandlerUtil
   */
  constructor(commandHandler) {
    this.commandHandler = commandHandler;
    this.client = commandHandler.client;
    /**
     * @private
     */
    this.awaitMessageOptions = {
      time: 30000,
      errors: ["time"],
      max: 1
    };

    /**
     * @private
     */
    this.embed = new MessageEmbed().setColor("#66ff33").setTimestamp();

    /**
     * @private
     */
    this.timeout = 30000;
  }



  /**
   * @param {arrayArgs[]} arrayArgs
   * @param {Discord.Message} message
   * @param {string} prefix
   * @param {Command} command
   * @returns {Promise<Collection<string,returnedArgsType> | string[]>}
   * @memberof CommandHandlerUtil
   */
  async parseArgs(arrayArgs, message, prefix, command) {
    
    const args = new Collection();
    let _message;
    const { timeout } = this;
    const {
      argsSkipMessage: skipMessage = "geç",
      argsCancelMessage: cancelMessage = "iptal",
      argsType = "betterArgs"
    } = command;

    if (argsType === "defaultArgs") {
      return this.parseCommandFromMessage(message, true);
    }
    
    const filter = (m) =>
      m.author.bot === false && m.author.id === message.author.id;
    for (const item of arrayArgs) {
      const { anahtar, tip, soru, def } = item;
      switch (tip) {
        case "channel":
          try {
            this.embed.setFooter(`Komutu iptal etmek için "${cancelMessage}" yazınız.\nKomut 30 saniye sonra otomatik iptal edilicektir.`);
            this.embed.setColor("#66ff33");
            this.embed.setDescription(soru);
            _message = await message.channel.send(this.embed);
            _message.delete({ timeout });
            const awaitMessage = (await message.channel.awaitMessages(filter, this.awaitMessageOptions)).first();
            if (awaitMessage.content === cancelMessage) {
              this.embed.setFooter(`Bizi tercih ettiğiniz için teşekkürler..`);
              this.embed.setColor("#ff0000");
              this.embed.setDescription("**Komut iptal edildi.**");
              _message = await message.channel.send(this.embed);
              _message.delete({ timeout });
              if (def) args.set(anahtar, message.channel);
              return args;
            }
            if (awaitMessage.content === skipMessage) {
              args.set(anahtar, skipMessage);
              this.embed.setFooter(`Bizi tercih ettiğiniz için teşekkürler..`);
              this.embed.setColor("#ff0000");
              this.embed.setDescription("**İşlem geçildi.**");
              _message = await message.channel.send(this.embed);
              _message.delete({ timeout });
            } else {
              if (
                this.isMentioned(awaitMessage.mentions) ||
                this.isTheChannelNameTold(awaitMessage, prefix)
              ) {
                if (this.isMentioned(awaitMessage.mentions)) {
                  if (
                    this.mentionedType(awaitMessage.mentions, tip) === "other"
                  ) {
                    this.embed.setDescription(`**Bir kanal etiketlemelisin.**`);
                    this.embed.setFooter(`${this.client.user.username}`, message.author.avatarURL({ dynamic: true, size: 4096 }));
                    this.embed.setColor("#ff0000");
                    _message = await message.channel.send(this.embed);
                    _message.delete({ timeout: 10000 });
                    args.set(anahtar, null);
                    if (def) args.set(anahtar, message.channel);
                  }
                }
                const channel = this.getChannel(awaitMessage, prefix);
                if (channel) {
                  args.set(anahtar, channel);
                } else {
                  args.set(anahtar, null);
                  if (def) args.set(anahtar, message.channel);
                }
              } else {
                const channel = this.getChannel(awaitMessage, prefix);
                if (!channel) {
                  args.set(anahtar, null);
                  if (def) args.set(anahtar, message.channel);
                }
              }
            }
          } catch (e) {
            this.embed.setDescription(`**İstek zaman aşımına ugradı.**`);
            this.embed.setFooter(`${this.client.user.username}`, message.author.avatarURL({ dynamic: true, size: 4096 }));
            this.embed.setColor("#ff0000");
            _message = await message.channel.send(this.embed);
            _message.delete({ timeout });
            args.set(anahtar, null);
            if (def) args.set(anahtar, message.channel);
          }
          break;
        case "role":
          this.embed.setFooter(`Komutu iptal etmek için "${cancelMessage}" yazınız.\nKomut 30 saniye sonra otomatik iptal edilicektir.`);
          this.embed.setColor("#66ff33");
          this.embed.setDescription(soru);
          _message = await message.channel.send(this.embed);
          _message.delete({ timeout });
          try {
            const awaitMessage = (await message.channel.awaitMessages(filter, this.awaitMessageOptions)).first();
            if (awaitMessage.content === cancelMessage) {
              this.embed.setFooter(`Bizi tercih ettiğiniz için teşekkürler..`);
              this.embed.setColor("#ff0000");
              this.embed.setDescription("**Komut iptal edildi.**");
              _message = await message.channel.send(this.embed);
              _message.delete({ timeout });
              return args;
            }
            if (awaitMessage.content === skipMessage) {
              args.set(anahtar, skipMessage);
              this.embed.setFooter(`Bizi tercih ettiğiniz için teşekkürler..`);
              this.embed.setColor("#ff0000");
              this.embed.setDescription("**İşlem geçildi.**");
              _message = await message.channel.send(this.embed);
              _message.delete({ timeout: 10000 });
            
            } else {
              if (
                this.isMentioned(awaitMessage.mentions) ||
                this.isTheRoleNameTold(awaitMessage, prefix)
              ) {
                if (this.isMentioned(awaitMessage.mentions)) {
                  if (
                    this.mentionedType(awaitMessage.mentions, tip) === "other") {
                    this.embed.setDescription(`**Bir rol etiketlemelisin.**`);
                    this.embed.setFooter(`${this.client.user.username}`, message.author.avatarURL({ dynamic: true, size: 4096 }));
                    this.embed.setColor("#ff0000");
                    _message = await message.channel.send(this.embed);
                    _message.delete({ timeout });
                    args.set(anahtar, null);
                  }
                }
                const role = this.getRole(awaitMessage, prefix);
                if (role) {
                  args.set(anahtar, role);
                } else {
                  args.set(anahtar, null);
                }
              } else {
                const role = this.getRole(awaitMessage, prefix);
                if (!role) {
                  args.set(anahtar, null);
                }
              }
            }
          } catch (e) {
            this.embed.setDescription(`**İstek zaman aşımına ugradı.**`);
            this.embed.setFooter(`${this.client.user.username}`, message.author.avatarURL({ dynamic: true, size: 4096 }));
            this.embed.setColor("#ff0000");
            _message = await message.channel.send(this.embed);
            _message.delete({ timeout });
            args.set(anahtar, null);
          }
          break;
        case "member":
          this.embed.setFooter(`Komutu iptal etmek için "${cancelMessage}" yazınız.\nKomut 30 saniye sonra otomatik iptal edilicektir.`);
          this.embed.setColor("#66ff33");
          this.embed.setDescription(soru);
          _message = await message.channel.send(this.embed);
          _message.delete({ timeout });
          try {
            const awaitMessage = (await message.channel.awaitMessages(filter, this.awaitMessageOptions)).first();
            if (awaitMessage.content === cancelMessage) {
              this.embed.setFooter(`Bizi tercih ettiğiniz için teşekkürler..`);
              this.embed.setColor("#ff0000");
              this.embed.setDescription("**Komut iptal edildi.**");
              _message = await message.channel.send(this.embed);
              _message.delete({ timeout });
              if (def) args.set(anahtar, message.member);
              return args;
            }
            if (awaitMessage.content === skipMessage) {
              args.set(anahtar, skipMessage);
              this.embed.setFooter(`Bizi tercih ettiğiniz için teşekkürler..`);
              this.embed.setColor("#ff0000");
              this.embed.setDescription("**İşlem geçildi.**");
              _message = await message.channel.send(this.embed);
              _message.delete({ timeout: 10000 });
            } else {
              if (
                this.isMentioned(awaitMessage.mentions) ||
                this.isTheMemberNameTold(awaitMessage, prefix)
              ) {
                if (this.isMentioned(awaitMessage.mentions)) {
                  if (
                    this.mentionedType(awaitMessage.mentions, tip) === "other") {
                    this.embed.setDescription(`**Bir üye etiketlemelisin.**`);
                    this.embed.setFooter(`${this.client.user.username}`, message.author.avatarURL({ dynamic: true, size: 4096 }));
                    this.embed.setColor("#ff0000");
                    _message = await message.channel.send(this.embed);
                    _message.delete({ timeout });
                    args.set(anahtar, null);
                    if (def) args.set(anahtar, message.member);
                  }
                }
                const member = this.getMember(awaitMessage, prefix);
                if (member) {
                  args.set(anahtar, member);
                } else {
                  args.set(anahtar, null);
                  if (def) args.set(anahtar, message.member);
                }
              } else {
                const member = this.getMember(awaitMessage, prefix);
                if (!member) {
                  args.set(anahtar, null);
                  if (def) args.set(anahtar, message.member);
                }
              }
            }
          } catch (e) {
            this.embed.setFooter(`${this.client.user.username}`, message.author.avatarURL({ dynamic: true, size: 4096 }));
            this.embed.setColor("#ff0000");
            this.embed.setDescription(`**İstek zaman aşımına ugradı.**`);
            _message = await message.channel.send(this.embed);
            _message.delete({ timeout });
            args.set(anahtar, null);
            if (def) args.set(anahtar, message.member);
          }
          break;
        case "user":
          this.embed.setFooter(`Komutu iptal etmek için "${cancelMessage}" yazınız.\nKomut 30 saniye sonra otomatik iptal edilicektir.`);
          this.embed.setDescription(soru);
          this.embed.setColor("#ff0000");
          _message = await message.channel.send(this.embed);
          _message.delete({ timeout });
          try {
            const awaitMessage = (await message.channel.awaitMessages(filter, this.awaitMessageOptions)).first();
            if (awaitMessage.content === cancelMessage) {
              this.embed.setFooter(`Bizi tercih ettiğiniz için teşekkürler..`);
              this.embed.setColor("#ff0000");
              this.embed.setDescription("**Komut iptal edildi.**");
              _message = await message.channel.send(this.embed);
              _message.delete({ timeout });
              if (def) args.set(anahtar, message.author);
              return args;
            }
            if (awaitMessage.content === skipMessage) {
              args.set(anahtar, skipMessage);
              this.embed.setFooter(`Bizi tercih ettiğiniz için teşekkürler..`);
              this.embed.setColor("#ff0000");
              this.embed.setDescription("**İşlem geçildi.**");
              _message = await message.channel.send(this.embed);
              _message.delete({ timeout: 10000 });
            } else {
              if (
                this.isMentioned(awaitMessage.mentions) ||
                this.isTheUserNameTold(awaitMessage, prefix)
              ) {
                if (this.isMentioned(awaitMessage.mentions)) {
                  if (
                    this.mentionedType(awaitMessage.mentions, tip) === "other") {
                    this.embed.setDescription(`**Bir kullanıcı etiketlemelisin.**`);
                    this.embed.setFooter(`${this.client.user.username}`, message.author.avatarURL({ dynamic: true, size: 4096 }));
                    this.embed.setColor("#ff0000");
                    _message = await message.channel.send(this.embed);
                    _message.delete({ timeout });
                    args.set(anahtar, null);
                    if (def) args.set(anahtar, message.author);
                  }
                }
                const user = this.getUser(awaitMessage, prefix);
                if (user) {
                  args.set(anahtar, user);
                } else {
                  args.set(anahtar, null);
                  if (def) args.set(anahtar, message.author);
                }
              } else {
                const user = this.getUser(awaitMessage, prefix);
                if (!user) {
                  args.set(anahtar, null);
                  if (def) args.set(anahtar, message.author);
                }
              }
            }
          } catch (e) {
            this.embed.setDescription(`**İstek zaman aşımına ugradı.**`);
            this.embed.setFooter(`${this.client.user.username}`, message.author.avatarURL({ dynamic: true, size: 4096 }));
            this.embed.setColor("#ff0000");
            _message = await message.channel.send(this.embed);
            _message.delete({ timeout });
            args.set(anahtar, null);
            if (def) args.set(anahtar, message.author);
          }
          break;
        case "yazı":
          this.embed.setFooter(`Komutu iptal etmek için "${cancelMessage}" yazınız.\nKomut 30 saniye sonra otomatik iptal edilicektir.`);
          this.embed.setDescription(soru);
          this.embed.setColor("#ff0000");
          _message = await message.channel.send(this.embed);
          _message.delete({ timeout });
          try {
            const awaitMessage = (await message.channel.awaitMessages(filter, this.awaitMessageOptions)).first();
            if (awaitMessage.content === cancelMessage) {
              this.embed.setFooter(`Bizi tercih ettiğiniz için teşekkürler..`);
              this.embed.setColor("#ff0000");
              this.embed.setDescription("**Komut iptal edildi.**");
              _message = await message.channel.send(this.embed);
              _message.delete({ timeout });
              return args;
            }
            if (awaitMessage.content === skipMessage) {
              args.set(anahtar, skipMessage);
              this.embed.setFooter(`Bizi tercih ettiğiniz için teşekkürler..`);
              this.embed.setColor("#ff0000");
              this.embed.setDescription("**İşlem geçildi.**");
              _message = await message.channel.send(this.embed);
              _message.delete({ timeout: 10000 });
            } else {
              const parsedCommand = this.parseCommandFromMessage(
                awaitMessage
              );
              if (parsedCommand.length > 0) {
                args.set(anahtar, parsedCommand);
              } else {
                this.embed.setFooter(`${this.client.user.username}`, message.author.avatarURL({ dynamic: true, size: 4096 }));
                this.embed.setDescription(`**Bir işlem belirtmediğiniz için iptal edildi.**`);
                this.embed.setColor("#ff0000");
                _message = await message.channel.send(this.embed);
                _message.delete({ timeout });
                args.set(anahtar, null);
              }
            }
          } catch (e) {
            this.embed.setDescription(`**İstek zaman aşımına ugradı.**`);
            this.embed.setFooter(`${this.client.user.username}`, message.author.avatarURL({ dynamic: true, size: 4096 }));
            this.embed.setColor("#ff0000");
            _message = await message.channel.send(this.embed);
            _message.delete({ timeout });
            args.set(anahtar, null);
          }
          break;
      }
    }
    return args;
  }



  /**
   * @param {Discord.MessageMentions} mentions
   * @returns {boolean}
   * @memberof CommandHandlerUtil
   */
  isMentioned(mentions) {
    let result = false;
    mentions.channels.size > 0 ? (result = true) : void 0;
    mentions.roles.size > 0 ? (result = true) : void 0;
    mentions.members.size > 0 ? (result = true) : void 0;
    mentions.users.size > 0 ? (result = true) : void 0;
    return result;
  }



  /**
   *
   *
   * @param {Discord.Message} message
   * @param {string} prefix
   * @returns {boolean}
   * @memberof CommandHandlerUtil
   */
  isTheChannelNameTold(message, prefix) {
    message.content = this.parsePrefix(prefix, message);
    let result = false;
    message.guild.channels.cache.find(
      (channel) => channel.name === message.content
    )
      ? (result = true)
      : void 0;
    message.guild.channels.cache.find(
      (channel) => channel.id === message.content
    )
      ? (result = true)
      : void 0;
    return result;
  }



  /**
   *
   *
   * @param {Discord.Message} message
   * @param {string} prefix
   * @returns {boolean}
   * @memberof CommandHandlerUtil
   */
  isTheRoleNameTold(message, prefix) {
    message.content = this.parsePrefix(prefix, message);
    let result = false;
    message.guild.roles.cache.find((role) => role.name === message.content)
      ? (result = true)
      : void 0;
    message.guild.roles.cache.find((role) => role.id === message.content)
      ? (result = true)
      : void 0;
    return result;
  }



  /**
   *
   *
   * @param {Discord.Message} message
   * @param {string} prefix
   * @returns {boolean}
   * @memberof CommandHandlerUtil
   */
  isTheMemberNameTold(message, prefix) {
    message.content = this.parsePrefix(prefix, message);
    let result = false;
    message.guild.members.cache.find(
      (member) => member.user.username === message.content
    )
      ? (result = true)
      : void 0;
    message.guild.members.cache.find(
      (member) => member.nickname === message.content
    )
      ? (result = true)
      : void 0;
    message.guild.members.cache.find((member) => member.id === message.content)
      ? (result = true)
      : void 0;
    return result;
  }



  /**
   *
   *
   * @param {Discord.Message} message
   * @param {string} prefix
   * @memberof CommandHandlerUtil
   */
  isTheUserNameTold(message, prefix) {
    message.content = this.parsePrefix(prefix, message);
    let result = false;
    message.client.users.cache.find((user) => user.username === message.content)
      ? (result = true)
      : void 0;
    message.client.users.cache.find((user) => user.id === message.content)
      ? (result = true)
      : void 0;
    return result;
  }



  /**
   *
   *
   * @param {Discord.Message} message
   * @param {string} prefix
   * @returns {Discord.GuildChannel}
   * @memberof CommandHandlerUtil
   */
  getChannel(message, prefix) {
    let channel;
    message.content = this.parsePrefix(prefix, message);
    if (this.isTheChannelNameTold(message, prefix)) {
      channel = message.guild.channels.cache.find(
        (channel) => channel.name === message.content
      );
      if (channel) return channel;
      channel = message.guild.channels.cache.find(
        (channel) => channel.id === message.content
      );
    } else {
      channel = message.mentions.channels.first();
    }
    return channel;
  }



  /**
   *
   *
   * @param {Discord.Message} message
   * @param {string} prefix
   * @returns {Discord.Role}
   * @memberof CommandHandlerUtil
   */
  getRole(message, prefix) {
    let role;
    message.content = this.parsePrefix(prefix, message);
    if (this.isTheRoleNameTold(message, prefix)) {
      role = message.guild.roles.cache.find(
        (role) => role.name === message.content
      );
      if (role) return role;
      role = message.guild.roles.cache.find(
        (role) => role.id === message.content
      );
    } else {
      role = message.mentions.roles.first();
    }
    return role;
  }



  /**
   *
   *
   * @param {Discord.Message} message
   * @param {string} prefix
   * @returns {Discord.GuildMember}
   * @memberof CommandHandlerUtil
   */
  getMember(message, prefix) {
    let member;
    message.content = this.parsePrefix(prefix, message);
    if (this.isTheMemberNameTold(message, prefix)) {
      member = this.getMemberByName(message);
    } else {
      member = message.mentions.members.first();
    }
    return member;
  }



  /**
   *
   *
   * @param {Discord.Message} message
   * @param {string} prefix
   * @returns {Discord.User}
   * @memberof CommandHandlerUtil
   */
  getUser(message, prefix) {
    let user;
    message.content = this.parsePrefix(prefix, message);
    if (this.isTheMemberNameTold(message, prefix)) {
      user = this.getUserByName(message);
    } else {
      user = message.mentions.users.first();
    }
    return user;
  }



  /**
   *
   *
   * @param {Discord.Message} message
   * @return {Discord.GuildMember}
   * @memberof CommandHandlerUtil
   */
  getMemberByName(message) {
    let member;
    if (
      message.guild.members.cache.find(
        (member) => member.nickname === message.content
      )
    ) {
      member = message.guild.members.cache.find(
        (member) => member.nickname === message.content
      );
    } else {
      member = message.guild.members.cache.find(
        (member) => member.user.username === message.content
      );
    }
    return member;
  }



  /**
   *
   *
   * @param {Discord.Message} message
   * @returns {Discord.User}
   * @memberof CommandHandlerUtil
   */
  getUserByName(message) {
    let user;
    if (
      message.guild.members.cache.find(
        (member) => member.nickname === message.content
      )
    ) {
      user = message.client.users.cache.get(
        message.guild.members.cache.find(
          (member) => member.nickname === message.content
        ).id
      );
    } else {
      user = message.client.users.cache.find(
        (user) => user.username === message.content
      );
    }
    return user;
  }



  /**
   *
   *
   * @param {string} prefix
   * @param {Discord.Message} message
   * @returns {string}
   * @memberof CommandHandlerUtil
   */
  parsePrefix(prefix, message) {
    if (message.content.startsWith(prefix)) {
      return message.content.split(" ").slice(1).join(" ");
    } else {
      return message.content;
    }
  }


  
  /**
   *
   *
   * @param {Discord.MessageMentions} mentions
   * @param {mentionsType} type
   * @returns {string}
   * @memberof CommandHandlerUtil
   */
  mentionedType(mentions, type) {
    switch (type) {
      case "channel":
        return mentions.channels.first() ? "channel" : "other";
        break;
      case "role":
        return mentions.roles.first() ? "role" : "other";
        break;
      case "member":
        return mentions.members.first() ? "member" : "other";
        break;
      case "user":
        return mentions.users.first() ? "user" : "other";
        break;
      default:
        break;
    }
  }


  
  /**
   *
   *
   * @param {Discord.Message} message
   * @param {boolean} startedCommand
   * @memberof CommandHandlerUtil
   * @returns {string[]}
   */
  parseCommandFromMessage(message, startedCommand = false) {
    if (startedCommand) {
      return message.content.split(" ").slice(1);
    } else {
      return message.content.split(" ");
    }
  }

  /**
   *
   *
   * @param {Command} command
   * @param {Discord.Message} message
   * @returns {boolean}
   * @memberof CommandHandler
   * 
   */
  noObstacle(command, message) {
    let result = false;
    const { author, member, channel, guild } = message;

    // Eğer komutu kullanan kişi botun sahiplerine dahil ise return false.
    if (this.client.isOwner(message.author.id)) return false;

    // Botlara cevap vermicekse ve mesaj sahibi botsa return true
    if (command.ignored.bots && author.bot) result = true;

    // Sahibe özel komut ise ve mesaj sahibi owner degilse return true.
    if (command.ownerOnly && !this.client.isOwner(author.id)) return true;

    // Sunucu özelse ve sunucu yoksa result true.
    if (command.guildOnly && !guild) result = true;

    // Yasaklı sunuculardan biri ise result true.
    if (
      command.ignored.guilds.includes(guild.id) ||
      this.commandHandler.ignored.guilds.includes(guild.id)
    )
      result = true;

    // Yasaklı kullanıcı ise result true.
    if (
      command.ignored.users.includes(author.id) ||
      this.commandHandler.ignored.users.includes(author.id)
    )
      result = true;

    // Yasaklı kanal ise result true.
    if (
      command.ignored.channels.includes(channel.id) ||
      this.commandHandler.ignored.channels.includes(channel.id)
    )
      result = true;
    if (member) {
      // Yasaklı rol ise result true.
      const memberRoles = member.roles.cache.array();
      for (const role of memberRoles) {
        if (
          command.ignored.roles.includes(role.id) ||
          this.commandHandler.ignored.roles.includes(role.id)
        )
          result = true;
      }

      // Eğer yetkisi yoksa.
      if (Array.isArray(command.permissions)) {
        command.permissions.forEach((perm) => {
          if (!member.hasPermission(perm)) {
            channel.send("**Bunun için yetkin yok.**");
            result = true;
          }
        });
      }

      if (Array.isArray(this.commandHandler.permissions)) {
        this.commandHandler.permissions.forEach((perm) => {
          if (!member.hasPermission(perm)) {
            channel.send("**Bunun için yetkin yok**");
            result = true;
          }
        });
      }
    }
    return result;
  }


  /**
   *
   *
   * @param {string} authorID
   * @param {Command} command
   * @param {Discord.Message} message
   * @returns {boolean}
   * @memberof CommandHandler
   */
  checkRateLimit(authorID, command, message) {
    if (this.client.isOwner(authorID)) return false;
    let { cooldown } = command;
    const timestamp = this.commandHandler.rateLimits.get(`${command.id}${authorID}`);
    
    // cooldown ve rateLimit'e yakalanma durumu için degişkenler.
    let rateLimitCaught;
    // Eğer cooldown 1000'den küçük ise ms(milisaniye) cinsine çeviriyoruz.
    if (this.commandHandler.rateLimits.has(`${command.id}${authorID}`)) {
      cooldown < 1000 ? (cooldown *= 1000) : void 0;
      if (Date.now() > (cooldown + timestamp)) {
        this.commandHandler.rateLimits.delete(`${command.id}${authorID}`);
        rateLimitCaught = false;
      } else {
        rateLimitCaught = true;
      }
    }
    if (rateLimitCaught) {
      let remainingTime = [...ms(cooldown - (Date.now() - timestamp)).toString().match(/[0-9]/g)][0];
      if (cooldown - (Date.now() - timestamp) < 1000) remainingTime = "0";
      const user = this.client.users.cache.get(authorID);
      this.client.emit("rateLimitCaught", user, message, remainingTime);
      this.commandHandler.emit("rateLimitCaught", user, message, remainingTime);
      return true;
    }
    this.commandHandler.rateLimits.set(`${command.id}${authorID}`, Date.now());
  }


  /**
   *
   * @param {Discord.Message} message
   * @param {"channel" | "guild"} [guildOrChannel="guild"]
   * @param {Discord.PermissionString[]} permType
   * @param {boolean} [sendMessage]
   * @param {Discord.GuildChannel} [channel]
   * @returns {boolean};
   * @memberof CommandHandlerUtil
   */
  checkBotPermission(message, permType, guildOrChannel = "guild", sendMessage = true, channel) {
    // Kanalda yetki araması yapılıcak ise.
    if (guildOrChannel === "channel") {
      let result = true;
      // Kanalın permission class'ını alıyoruz
      const permissions = message.guild.me.permissionsIn(channel || message.channel);
      // Permleri döngüye alıyoruz.
      permType.forEach((perm) => {
        // Eğer perm yoksa result = false.
        if (!permissions.has(Permissions.FLAGS[perm])) result = false;
      });
      if (!result) {
        // eğer yetkisi var ise gerekli olan yetkileri bildiriyor.
        const permMapping = permType.map((perm) => Perms[perm]);
        if (sendMessage) message.channel.send(`**Bu komut için bu kanalda [${permMapping.join(" , ")}] yetkilerine ihtiyacım var.**`)
          .then((msg) => msg.delete({ timeout: 10000 }));
        return false;
      }
    } else {
      let result = true;
      permType.forEach((perm) => {
        if (!message.guild.me.hasPermission(perm)) result = false;
      });
      if (!result) {
        // eğer yetkisi var ise gerekli olan yetkileri bildiriyor.
        const permMapping = permType.map((perm) => Perms[perm]);
        if (sendMessage) message.channel.send(`**Bu komut için rollerimde [${permMapping.join(" , ")}] yetkilerine ihtiyacım var.**`)
          .then((msg) => msg.delete({ timeout: 10000 }));
        return false;
      }
    }
    return true;
  }
}


module.exports = {
    CommandHandlerUtil
};



/**
 * @typedef {import("./Command").argsOptions} arrayArgs
 */





/**
 * @typedef {import("./CommandHandler")._CommandHandler} CommandHandler
 */


/**
 * @typedef {"user" | "member" | "channel" | "role"} mentionsType
 * 
 */



/**
 * @typedef {User | GuildMember | GuildChannel | Role | string | string[] | number | number[]} returnedArgsType
 */


 /**
 * @typedef {import("./Command")._Command} Command
 */

