const coreFunctions = require("./core");
const translations = require("./translations");
const signale = require("signale");

const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

//Print message for packages
signale.success(translations.getPhrase("packageInstalled"));
setTimeout(() => {
    start();
}, 2000)

/**
 * Start application
 */
async function start() {

    //Print welcome message
    var msg = translations.getPhrase("WelcomeMessageOnStart");
   
    signale.success(msg);

    coreFunctions.selectMode();

}


