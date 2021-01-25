![Image](https://i.hizliresim.com/Rtt56g.png)







# { -YAND- }
* Belirtilen komut ve event dosyalarının hepsini okur.
* Komut ekleme, çıkarma, yeniden yükleme özellikleri.


# { NEWS }
* Sunucu özel prefix ayarlama özelliği eklendi.
## Example
```javascript
this.commandHandler = new CommandHandler(this, {
        // directory: Komutların bulunduğu klasör.
        directory: "./commands",
        // prefix: Botun prefixleri.
        prefix: (message) => {
          const customPrefix = db.fetch(`prefix_${message.guild.id}`);
          if(customPrefix) return customPrefix
          else return ["g9","y!"];
        },
        // allCommandCooldown: Bütün komutların bekleme süresidir.
        // Saniye yada milisaniye cinsinden belirtilir.
        // Eğer komuta özel cooldown varsa komutta importantCooldown:true olmak zorundadır. eğer olmaz ise burdaki cooldown geçerli olacaktır.
        allCommandCooldown: 5000,
        // ignored: Bütün komutlarda geçerlidir.
        ignored: {
          // İdsi girilen kanallarda komut kullanılamaz.
          channels: ["kanal id", "kanal id"],
          // İdsi girilen rollere sahip üyeler kullanamaz.
          roles: ["rol id", "rol id"],
          // İdsi girilen sunucularda kullanılamaz.
          guilds: ["sunucu id", "sunucu id"],
          // İdsi girilen kullanıcılar kullanamaz.
          users: ["kullanıcı id", "kullanıcı id"]
        },
        // permissions: Bu yetkilere sahip değil ise çalışmayacak.
        // Bütün komutlarda geçerlidir.
        permissions: ["MANAGE_CHANNELS", "MANAGE_EMOJIS"],
        // Botu etiketleyince prefixleri gösterir.
        tagPrefix:true
      });
```

# YandCommands
* Komut takma adları. [Aliases]
* Komutlarda bekleme süresi. [cooldown]
* Komutlara özel yetki kontrol sistemi. [ChechPermissions]
* Çoklu prefix. (Komutlara özel prefixlerde kullanabilirsiniz.) [MultiplePrefix]
* Gelişmiş argüman sistemi.
* Komutu kanallara, rollere, kullanıcılara, sunuculara yasaklı hale getirme.
* Komutlar sahip(lere) özel.(isteğe bağlı.)
* Komut sunucu özel.(DM'de kullanılamaz, isteğe bağlı.)
* Komuttan CommandHandler classının metodları kullanılabilir.

# Listener
* Listener Classından komut eventlerine ulaşabilinir. (Ulaşabilmek için ListenerHandler.setHandler(CommandHandler) metodu kullanılmalı.)


# Yüklemek için
* NodeJs 12+ ve discord.js v12 gerekli.
```bash
npm install discord-yand
```
```bash
npm i discord.js
```


# Links
[WebSite(gelecek)](https://github.com/wioenena-q/discord-yand)<br>
----------------
[Repository](https://github.com/wioenena-q/discord-yand)<br>
----------
[wioenena.q](https://instagram.com/wioenena.q?igshid=14wa0mavi3qrr)
-----------
[maven](https://instagram.com/qfurkan_demircan?igshid=9vm6wp0b0hw5)
------



# examples
## Client oluşturma örneği
```javascript
const { YandClient, CommandHandler, ListenerHandler } = require("discord-yand")


class Client extends YandClient {
    constructor() {
      // owners: botun sahiplerinin idlerinin bulunduğu bölüm.
      super({
        owners: ["kullanıcı id", "kullanıcı id"]
      });

      this.listenerHandler = new ListenerHandler(this, {
        // directory: Eventlerin bulunduğu klasör.
        directory: "./listener"
      });

      this.commandHandler = new CommandHandler(this, {
        // directory: Komutların bulunduğu klasör.
        directory: "./commands",
        // prefix: Botun prefixleri.
        prefix: ["!", "?"],
        // allCommandCooldown: Bütün komutların bekleme süresidir.
        // Saniye yada milisaniye cinsinden belirtilir.
        // Eğer komuta özel cooldown varsa komutta importantCooldown:true olmak zorundadır. eğer olmaz ise burdaki cooldown geçerli olacaktır.
        allCommandCooldown: 5000,
        // ignored: Bütün komutlarda geçerlidir.
        ignored: {
          // İdsi girilen kanallarda komut kullanılamaz.
          channels: ["kanal id", "kanal id"],
          // İdsi girilen rollere sahip üyeler kullanamaz.
          roles: ["rol id", "rol id"],
          // İdsi girilen sunucularda kullanılamaz.
          guilds: ["sunucu id", "sunucu id"],
          // İdsi girilen kullanıcılar kullanamaz.
          users: ["kullanıcı id", "kullanıcı id"]
        },
        // permissions: Bu yetkilere sahip değil ise çalışmayacak.
        // Bütün komutlarda geçerlidir.
        permissions: ["MANAGE_CHANNELS", "MANAGE_EMOJIS"],
        // Botu etiketleyince prefixleri gösterir.
        tagPrefix:true
      });
      // CommandHandler eventlerine erişmemizi sağlar.
      this.listenerHandler.setHandler(this.commandHandler);
      // Bütün eventleri yükler.
      // Eğer CommandHandler eventlerine erişmek istiyorsanız this.listenerHandler.setHandler(this.commandHandler); metodu kullanılmalıdır.
      this.listenerHandler.loadAllListener();
      // YandClient'in sunduğu eventleri kullanırsınız.
      this.loadCustomEvent();
      // Bütün komutları yükler
      this.commandHandler.loadAllCommands();
    }
}



const client = new Client();

client.login("tokeniniz");
```


## Komut oluşturma örneği
```javascript
const { Command } = require("discord-yand");








class RolRengiDegiştirmeKomutu extends Command {
    constructor() {
        // super'de ilk parametre komut ismidir, 2. parametre olarak ayarları alır.
        super("rol-rengi-degiştir", {
          cooldown: 50000, // Komuta bekleme süresi koyar. (Saniye yada Milisaniye cinsinden)
          importantCooldown: true, // CommandHandler'de bütün komutlara cooldown uygulanmışsa ve bu komutta bu özellik true ise bu komutun cooldownu işler.
          // args kullanıcıdan  alınıcak veriler içindir.
          // args tipleri "user" | "member" | "channel" | "role" | "yazı"'dır.
          // anahtar veriyi çekecegimiz ana bölümdür.
          // soru kişiye sorulacak sorudur
          // def true ve kullanıcı cevap vermediyse varsayılan bir değer döner
          // varsayılan değer yazı ve rol tiplerı dışında hepsinde çalışır.
          args: [
            {
              tip: "role",
              anahtar: "rengiDegişicekRol",
              soru: "Lütfen rengini degiştireceğim rolü belirt.",
              def:true
            },
            {
              tip: "yazı",
              anahtar: "rolRengi",
              soru: "Lütfen rengi belirt."
            }
          ],
          // prefix özelligi komuta özel prefixtir. bunlarla kullanılsa bile çalışır.
          prefix: ["g9?", "g9!"],
          // Komut ismi ile değil de bunlarla başlarsa yine çalışır.
          aliases: ["rolRengiDegiştir", "rolrngidegistir"],
          // Eğer true ise komutu kullanan botun sahiplerine dahil degil ise çalışmayacaktır.
          ownerOnly: false,
          // Sunucu içinde kullanılacaksa true olmalı.
          guildOnly: true,
          // Komutun kategorisini belirtiyoruz.
          category: "Rol-Komutları",
          // Komutun açıklaması.
          description: "Bu komut ile rol rengi degiştirirsin.",
          ignored: {
            // Botlar kullanamaz komutu. eğer belirtilmezse yine kullanamazlar.
            bots: true,
            // İdsi girilen kanallarda komut kullanılamaz.
            channels: ["kanal id", "kanal id"],
            // İdsi girilen rollere sahip üyeler kullanamaz.
            roles: ["rol id", "rol id"],
            // İdsi girilen sunucularda kullanılamaz.
            guilds: ["sunucu id", "sunucu id"],
            // İdsi girilen kullanıcılar kullanamaz.
            users: ["kullanıcı id", "kullanıcı id"]
            },
          // Bu yetkilere sahip değil ise çalışmayacak.
          permissions:["ADMINISTRATOR", "MANAGE_CHANNELS"]
        });
    }

    exec(message, args) {
        // Eğer kullanıcı hiçbir cevap vermedi ise(args sisteminde) return ediyoruz.
        if (!args) return message.channel.send("Hatalı kullanım.");
        // Dönen değer discord.js Role classını döner özelliklerine bakmak için discord.js dökümanlarına bakınız.
        const role = args.get("rengiDegişicekRol");
        // Dönen değer string array'dır.(tipi yazı olan bütün args değerlerinde dönen tip string array'dır)
        const renk = args.get("rolRengi");
        role.setColor(renk.join(" "));
        const embed = new this.MessageEmbed()
        .setDescription("İşlem başarılı.");
        this.channel.send(embed); 
    }
}


module.exports = RolRengiDegiştirmeKomutu;
```


## Event dinleme örneği
```javascript
const { Listener } = require("discord-yand");








class ReadyEvent extends Listener {
    constructor() {
        super({
            // event: eventin ismi.
            event: "ready",
            // emitter: Bot ise Normal discord.js eventleri tetiklenince çalışır.
            // YandClient ise CommandHandler eventlerine ulaşılır.
            emitter: "Bot"
        });
    }

    exec() {
        console.log(`${this.client.user.username} Hazır`);
    }
}
module.exports = ReadyEvent;
```
---------