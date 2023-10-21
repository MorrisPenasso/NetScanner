var coreFunctions = require("./core");
var translations = require("./translations");
var signale = require("signale");
var readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
//Print message for packages
signale.success(translations.getPhrase("packageInstalled"));
setTimeout(function () {
    start();
}, 2000);
/**
 * Starts the program.
 */
function start() {
    // Print welcome message
    var msg = translations.getPhrase("WelcomeMessageOnStart");
    signale.success(msg);
    // Select mode
    coreFunctions.selectMode();
}
//# sourceMappingURL=app.js.map