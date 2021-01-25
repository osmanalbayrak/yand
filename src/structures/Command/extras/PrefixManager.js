const { YandClient } = require("../../YandClient");
const {
    Collection,
    Guild,
    Message
} = require("discord.js");
const { Command } = require("../Command");






class PrefixManager {

    /**
     * @param {YandClient} client
     * @param {string[] | Function} prefix
     */
    constructor(client, prefix) {
        // Client classına erişiyorum
        this.client = client;
        
        // Sunucu özel prefixler burda biriktirilicek.
        /**
         * @type {Collection<string,string[]>}
         */
        this.guildPrefixes = new Collection();

        /**@type {string[] | Function} */
        // Array yada fonksiyon dönücek.
        this.handlePrefixFunctionOrArray = prefix;

        /**@type {{prefixes:string[], commandPrefixes:string[]}} */
        // Komutların ve kullanıcının belirttiği prefixleri burda topliyacağız.
        this.allPrefix = {
            prefixes: [],
            commandPrefixes: []
        };
    }


    /**
     * @param {Message} message
     * @returns {Promise<any>}
     */
    handlePrefix(message) {
        return new Promise(async (resolve) => {
            const { guild } = message;
            
            // Eğer sunucu özel prefix sistemi varsa fonksiyon girmeli
            if (typeof this.handlePrefixFunctionOrArray === "function") {
                let guildSpecificPrefix;
                // asenkron bir fonksiyon ise await kullanmak zorundayız çünkü kullanmama durumunda Promise dönme ihtimali var.
                if (this.client.util.isPromise(this.handlePrefixFunctionOrArray)) {
                    guildSpecificPrefix = await this.handlePrefixFunctionOrArray(message);
                } else {
                    // Normal fonksiyonu çagırıyoruz.
                    guildSpecificPrefix = this.handlePrefixFunctionOrArray(message);
                }
                // Eğer sunucu özel prefix var ise
                if (guildSpecificPrefix) {
                    
                    // Eğer sunucu özel prefixler array dönüyor ise
                    if (Array.isArray(guildSpecificPrefix)) {
                        
                        // İç içe array olma olasılığını ortadan kaldırıyoruz.
                        const parsedArray = this.parseArray(guildSpecificPrefix);
                        
                        // parsedArray değişkeninini döngüye alıp sunucunun prefixlerini kaydettiriyoruz.
                        for (const prefix of parsedArray) {
                            this.addToGuildPrefixes(guild, prefix);
                        }
                    } else {
                        // Tek bir sonuç döneceği için direk kaydettiriyoruz.
                        this.addToGuildPrefixes(guild, guildSpecificPrefix);
                    }
                } else {
                    // Eğer fonksiyon değer dönmez ise varsayılan prefixi ayarlıyoruz.
                    this.addPrefixToAllPrefix(".");
                }
            } else {
                // Eğer iç içe array kullanıldıysa onları ayrıştırıcak.
                this.handlePrefixFunctionOrArray = this.parseArray(this.handlePrefixFunctionOrArray);

                this.handlePrefixFunctionOrArray.forEach((prefix) => {
                    this.addPrefixToAllPrefix(prefix);
                });
            }
            resolve(undefined);
        });
    }

    /**
     *
     * Botun bütün sunucularının prefix listesini oluşturur.
     * @returns {Promise<void>}
     */
    init() {
        return new Promise((resolve) => {
            this.client.guilds.cache.forEach((guild) => this.guildPrefixes.set(guild.id, []));
            resolve();
        });
    }

    /**
     * Sunucu prefixlerine yeni prefix ekler
     * @param {Guild} guild
     * @param {string} prefix
     * @returns {Promise<this>}
     */
    addToGuildPrefixes(guild, prefix) {
        return new Promise((resolve) => {
            const guildPrefixes = this.guildPrefixes.get(guild.id);
            if (guildPrefixes) {
                guildPrefixes.push(prefix);
                this.guildPrefixes.set(guild.id, this.deleteRepeatedItem(guildPrefixes));
                resolve(this);
            } else return;
        });
    }

    /**
     * Tekrar eden prefixleri siler.
     * @param {string[]} arr
     * @returns {any[]}
     */
    deleteRepeatedItem(arr) {
        const res = [];
        arr.forEach((item, i) => {
            const index = arr.findIndex((_item) => item === _item);
            if (i === index) res.push(arr[index]);
        });
        return res;
    }

    /**
     * İç içe arraylari tek arrayde toplar ve geri döner.
     * @param {Array<any>} array
     * @returns {Array<any>}
     */
    parseArray(array) {
        const result = [];
        function repeat(arr) {
            for (const _item of arr) {
                if (Array.isArray(_item)) {
                    repeat(_item);
                } else {
                    result.push(_item);
                }
            }
        }
        repeat(array);
        return result;
    }

    /**
     * Sunucunun prefixlerini döndüren method.
     * @param {Guild} guild
     * @returns {string[]}
     */
    getGuildPrefixes(guild) {
        const guildPrefixes = this.guildPrefixes.get(guild.id);
        return guildPrefixes ? guildPrefixes : [];
    }

    /**
     * allPrefix array'ına veri ekler.
     * @param {string} prefix
     * @returns {void}
     */
    addPrefixToAllPrefix(prefix, isCommandPrefix = false) {
        if (isCommandPrefix) this.allPrefix.commandPrefixes.push(prefix);
        else this.allPrefix.prefixes.push(prefix);
        this.allPrefix.prefixes = this.deleteRepeatedItem(this.allPrefix.prefixes);
        return;
    }

    /**
     * Komuttaki prefixlerin hepsini allPrefix.commandPrefixes'e ekler
     * @param {Command} command
     * @returns {void}
     */
    commandPrefixAddToAllPrefix(command) {
        // İç içe array kullanıldıysa ayrıştırıyoruz ve aynı olan prefixleri siliyoruz.
        command.prefix = this.deleteRepeatedItem(this.parseArray(command.prefix));
        command.prefix.forEach((prefix) => {
            this.addPrefixToAllPrefix(prefix, true);
        });
        return;
    }

    /**
     * Komut hangi prefix ile başlıyorsa o prefixi döner.
     * @param {Message} message
     * @param {Collection<string,Command>} commandCollection
     * @returns {Promise<string>}
     */
    getRealPrefix(message, commandCollection) {
        return new Promise((resolve) => {
            let prefix;
            const { content, guild } = message;
            const guildPrefixes = this.getGuildPrefixes(guild);
            const allPrefix = [...this.allPrefix.prefixes, ...this.allPrefix.commandPrefixes, ...guildPrefixes];
            allPrefix.forEach((_prefix) => {
                if (content.startsWith(_prefix)) {
                    const _command = content.slice(_prefix.length).split(" ")[0];
                    const command = commandCollection.get(_command);
                    if (
                        command !== undefined &&
                        !command.prefix.includes(_prefix) &&
                        !this.allPrefix.prefixes.includes(_prefix) &&
                        !guildPrefixes.includes(_prefix)
                    ) prefix = undefined;
                    else prefix = _prefix;
                }
            });
            resolve(prefix);
        });
    }
}


module.exports = {
    PrefixManager
};