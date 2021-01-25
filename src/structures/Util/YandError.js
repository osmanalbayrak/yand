const chalk = require("chalk");


















class YandError extends Error {



    
    /**
     * Creates an instance of YandError.
     * @param {string} errorType
     * @param {...any} args
     * @memberof YandError
     */
    constructor(errorType, ...args) {
        super(chalk.cyan(args.join(" ")));
        this.code = errorType;
    }

    get name() {
        return chalk.red(`YandError [ ${this.code} ]`);
    }
}



module.exports = {
    YandError
};