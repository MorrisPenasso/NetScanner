const coreFunctions: any = require("./core");
const translations: any = require("./translations");
const signale: any = require("signale");
const readline: any = require('readline');

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

//Print message for packages
signale.success(translations.getPhrase("packageInstalled"));
setTimeout(() => {
    start();
}, 2000)

/**
 * Starts the program.
 */
function start(): void {

    // Print welcome message
    var msg = translations.getPhrase("WelcomeMessageOnStart");
    
    signale.success(msg);

    // Select mode
    coreFunctions.selectMode();
}