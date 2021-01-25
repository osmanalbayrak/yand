








declare module "discord-yand" {
    import {
        Client,
        ClientOptions,
        Snowflake,
        Collection,
        Message,
        AwaitMessagesOptions,
        MessageEmbed,
        MessageMentions,
        GuildChannel,
        Role,
        GuildMember,
        User,
        PermissionString,
        Guild,
        ClientEvents,
        DMChannel,
        TextChannel,
        NewsChannel,
        MessageAttachment
    } from "discord.js";
    import { EventEmitter } from "events";


    // Class
    export class YandClient extends Client {
        public constructor(YandOptions?: YandClientOptions, ClientOptions?: ClientOptions);
        public owners: Snowflake[] | Snowflake;
        public util: YandUtil;
        public isOwner(id: string): boolean;
        public on<K extends keyof YandEvents>(event: K, listener: (...args: YandEvents[K]) => void): this;
        public on<S extends string | symbol>(event: Exclude<S, YandEvents>,listener: (...args: any[]) => void): this;
        
        
        public emit<K extends keyof YandEvents>(event: K, ...args: YandEvents[K]): boolean;
        public emit<S extends string | symbol>(
            event: Exclude<S, keyof YandEvents>,
            ...args: any[]
        ): boolean;


        public once<K extends keyof YandEvents>(event: K, listener: (...args: YandEvents[K]) => void): this;
        public once<S extends string | symbol>(
            event: Exclude<S, keyof YandEvents>,
            listener: (...args: any[]) => void
        ): this;


        public off<K extends keyof YandEvents>(event: K, listener: (...args: YandEvents[K]) => void): this;
        public off<S extends string | symbol>(
            event: Exclude<S, keyof YandEvents>,
            listener: (...args: any[]) => void
        ): this;


        public removeAllListeners<K extends keyof YandEvents>(event?: K): this;
        public removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof YandEvents>): this;

    }

    export class YandUtil {
        public constructor(client: YandClient);
        public client: YandClient;
        public isPromise(func: Function): boolean;
    }

    export class YandError {
        public constructor(errorType: string, ...args: any);
        public code: string;
        public get name(): string;
    }

    export class YandHandler extends EventEmitter {
        public constructor(client: YandClient);
        public client: YandClient;
        public parseDirectoryFiles(directory: string): string[];
    }

    export class CommandHandler extends YandHandler {
        public constructor(client: YandClient, options: CommandHandlerOptions)
        public directory: string;
        public commands: Collection<string, Command>;
        public aliases: Collection<string, string>;
        public ignored: IgnoredOptions;
        public util: CommandUtil;
        public categories: Collection<string, Command[]>;
        public allCategoryName: string[];
        public listenerHandler?: ListenerHandler;
        public rateLimits: Collection<string, number>;
        public allCommandCooldown: number;
        public permissions: PermissionString[] | PermissionString;
        public tagPrefix: boolean;
        public prefixManager: PrefixManager;
        public loadAllCommands(): Promise<void>;
        public handle(message: Message): Promise<any>;
        public reloadCommand(id: string): Promise<Command>;
        public reloadAllCommand(): Promise<void>;
        public loadCategory(command: Command): Promise<void>
        public deleteAllCategory(): Promise<void>;
        public deleteCommand(id: string): Promise<this>;
        public addCommand(command: Command): Promise<boolean>;
        public addAliases(aliases: string[], commandName: string): Promise<boolean>;
        public setPrototype(key: string, value: any): this;
        public setHandler(handler: ListenerHandler): this;
        public on<K extends keyof CommandHandlerEvents>(event: K, listener: (...args: CommandHandlerEvents[K]) => void): this;
        public on<S extends string | symbol>(
            event: Exclude<S, keyof CommandHandlerEvents>,
            listener: (...args: any[]) => void
        );


        public emit<K extends keyof CommandHandlerEvents>(event: K, ...args: CommandHandlerEvents[K]): boolean;
        public emit<S extends string | symbol>(
            event: Exclude<S, keyof CommandHandlerEvents>,
            ...args: any[]
        ): boolean;


        public once<K extends keyof CommandHandlerEvents>(event: K, listener: (...args: CommandHandlerEvents[K]) => void): this;
        public once<S extends string | symbol>(
            event: Exclude<S, keyof CommandHandlerEvents>,
            listener: (...args: any[]) => void
        ): this;


        public off<K extends keyof CommandHandlerEvents>(event: K, listener: (...args: CommandHandlerEvents[K]) => void): this;
        public off<S extends string | symbol>(
            event: Exclude<S, keyof CommandHandlerEvents>,
            listener: (...args: any[]) => void
        ): this;


        public removeAllListeners<K extends keyof CommandHandlerEvents>(event?: K): this;
        public removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof CommandHandlerEvents>): this;

    }

    export interface CommandHandlerEvents {
        rateLimitCaught: [User, Message, number];
        commandStart: [Message, Command, Collection<string, returnedArgsType>];
        commandEnd: [Message, Command, Collection<string, returnedArgsType>];
        deleteCommand: [Command];
        updateCommandList: [Collection<string, Command>];
        reloadAllCommand: [Collection<string, Command>];
        reloadCommand: [Command];
        updateCommand: [Command, Command];
        debug: [...any];
    }

    export class CommandHandlerUtil {
        public constructor(client: YandClient);
        public client: YandClient;
        private awaitMessageOptions: AwaitMessagesOptions;
        private embed: MessageEmbed;
        private timeout: number;
        public parseArgs(arrayArgs: argsOptions[], message: Message, prefix: string, command: Command): Promise<Collection<string, any> | string[]>;
        public isMentioned(mentions: MessageMentions): boolean;
        public isTheChannelNameTold(message: Message, prefix: string): boolean;
        public isTheRoleNameTold(message: Message, prefix: string): boolean;
        public isTheMemberNameTold(message: Message, prefix: string): boolean;
        public isTheUserNameTold(message: Message, prefix: string): boolean;
        public getChannel(message: Message, prefix: string): GuildChannel;
        public getRole(message: Message, prefix: string): Role;
        public getMember(message: Message, prefix: string): GuildMember;
        public getUser(message: Message, prefix: string): User;
        public getMemberByName(message: Message): GuildMember;
        public getUserByName(message: Message): User;
        public parsePrefix(prefix: string, message: Message): string;
        public mentionedType(mentions: MessageMentions, type: MentionsType): string;
        public parseCommandFromMessage(message: Message, startedCommand: boolean): string[];
        public checkRateLimit(authorID: string, command: Command, message: Message): boolean;
        public checkRateLimit(authorID: Snowflake, command: Command, message: Message): boolean;
        public noObstacle(command: Command, message: Message): boolean;
        public checkBotPermission(message: Message, permType: PermissionString[], guildOrChannel?: "channel" | "guild", sendMessage?: boolean, channel: GuildChannel): boolean;
    }


    export abstract class Command {
        public constructor(id: string, options?: CommandOptions);
        public id: string;
        public aliases: string[];
        public cooldown: number;
        public ownerOnly: boolean;
        public guildOnly: boolean;
        public prefix: string[];
        public category: string;
        public description: string;
        public channel: any;
        public client: YandClient;
        public guild: Guild;
        public args: argsOptions[];
        public ignored: IgnoredOptions;
        public permissions: PermissionString;
        public path: string;
        public listenerHandler: ListenerHandler;
        public commandHandler: CommandHandler;
        public importantCooldown: boolean;
        public MessageEmbed: typeof MessageEmbed;
        public MessageAttachment: typeof MessageAttachment;
        public argsType: "defaultArgs" | "betterArgs";
        public argsSkipMessage: string;
        public argsCancelMessage: string;
        public botPermissions: BotPermissionsOptions;
        public abstract exec(...args: any[]): any;
    }

    export class PrefixManager {
        public constructor(client: YandClient, prefix: string[] | Function): this;
        public client: YandClient;
        public guildPrefixes: Collection<string, string[]>;
        public handlePrefixFunctionOrArray: string[] | Function;
        public allPrefix: {
            prefixes: string[],
            commandPrefixes: string[]
        };
        public handlePrefix(message: Message): Promise<any>;
        public init(): Promise<void>;
        public addToGuildPrefixes(guild: Guild, prefix: string): Promise<this>;
        public deleteRepeatedPrefix(arr: string[]): string[];
        public parseArray(array: any[]): any[];
        public getGuildPrefixes(guild: Guild): string[];
        public addPrefixToAllPrefix(prefix: string, isCommandPrefix?: boolean): void;
        public commandPrefixAddToAllPrefix(command: Command): void;
        public getRealPrefix(message: Message, commandCollection: Collection<string, Command>): Promise<string>;
    }

    export class ListenerHandler extends YandHandler{
        public constructor(client: YandClient, options: ListenerHandlerOptions);
        public client: YandClient;
        public directory: string;
        public commandHandler: CommandHandler;
        public loadAllListener(): this;
        public setHandler(handler: CommandHandler): this;
        public setPrototype(key: string, value: any): this;
        public loadCustomEvent(): void;

        public on<K extends keyof ListenerHandlerEvents>(event: K, listener: (...args: ListenerHandlerEvents[K]) => void): this;
        public on<S extends string | symbol>(
            event: Exclude<S, keyof ListenerHandlerEvents>,
            listener: (...args: any[]) => void
        );


        public emit<K extends keyof ListenerHandlerEvents>(event: K, ...args: ListenerHandlerEvents[K]): boolean;
        public emit<S extends string | symbol>(
            event: Exclude<S, keyof ListenerHandlerEvents>,
            ...args: any[]
        ): boolean;


        public once<K extends keyof ListenerHandlerEvents>(event: K, listener: (...args: ListenerHandlerEvents[K]) => void): this;
        public once<S extends string | symbol>(
            event: Exclude<S, keyof ListenerHandlerEvents>,
            listener: (...args: any[]) => void
        ): this;


        public off<K extends keyof ListenerHandlerEvents>(event: K, listener: (...args: ListenerHandlerEvents[K]) => void): this;
        public off<S extends string | symbol>(
            event: Exclude<S, keyof ListenerHandlerEvents>,
            listener: (...args: any[]) => void
        ): this;


        public removeAllListeners<K extends keyof ListenerHandlerEvents>(event?: K): this;
        public removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof ListenerHandlerEvents>): this;

    }

    export interface ListenerHandlerEvents {
        guildBotAdd: [Guild, User, User];
    }

    export abstract class Listener {
        public constructor(options?: ListenerOptions);
        public client: YandClient;
        public event:keyof YandEvents;
        public emitter: "Bot" | "YandClient";
        public abstract exec(...args: any[]): any;
    }

    // Interfaces
    export interface YandClientOptions {
        owners?: Snowflake[] | Snowflake;
    }

    export interface CommandHandlerOptions {
        directory: string;
        prefix?: string[] | Function;
        ignored?: IgnoredOptions;
        allCommandCooldown?: number;
        permissions?: PermissionString[] | PermissionString;
        autoReply?: autoReplyOptions[];
        tagPrefix?: boolean;
    }
    
    export interface argsOptions {
        tip: "user" | "member" | "channel" | "role" | "yazı";
        anahtar: string;
        soru: string;
        def?: boolean;
    }

    export interface CommandOptions {
        aliases?: string[];
        cooldown?: number;
        ownerOnly?: boolean;
        guildOnly?: boolean;
        prefix?: string[];
        category?: string;
        description?: string;
        args?: argsOptions[];
        ignored?: IgnoredOptions;
        permissions?: PermissionString[] | PermissionString;
        importantCooldown?: boolean;
        argsType?: "defaultArgs" | "betterArgs";
        argsSkipMessage?: string;
        argsCancelMessage?: string;
        botPermissions?: BotPermissionsOptions;
    }

    export interface BotPermissionsOptions {
        guildOrChannel: "channel" | "guild";
        permissions: PermissionString[];
        channel?: Function;
    }

    export interface ListenerOptions{
        event:keyof YandEvents;
        emitter: "Bot" | "YandClient";
    }


    export interface IgnoredOptions {
        guilds?: Snowflake[];
        users?: Snowflake[];
        roles?: Snowflake[];
        channels?: Snowflake[];
        bots?: boolean;
    }

    export interface autoReplyOptions {
        message: string,
        cevap:string
    }

    export interface ListenerHandlerOptions {
        directory: string;
    }

    // type
    export type MentionsType = "user" | "member" | "channel" | "role";
    export type returnedArgsType = User | GuildMember | GuildChannel | Role | string[] | string | number[] | number;
    export type YandEvents = ClientEvents & CommandHandlerEvents & ListenerHandlerEvents;
}