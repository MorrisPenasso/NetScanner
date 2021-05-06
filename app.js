const asciify = require("asciify-image"); // library to create asciify images
const coreFunctions = require("./core");
const translations = require("./translations");
const signale = require("signale");

const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

var isStarted = false; // for not duplicate enter keypress event

//Print message for packages
signale.success(translations.getPhrase("packageInstalled"));
setTimeout(() => {
    showLogo();
}, 2000)

/**
 * Show  or not application logo and start application
 */
function showLogo() {
    var optionsAsciify = {
        fit: 'box',
        width: 15,
        height: 15
    };
    asciify('./images/image.png', optionsAsciify, async function (err, asciified) {
        if (err) throw err;

        // Print to console
        console.log(asciified);

        //Print welcome message
        var msg = translations.getPhrase("WelcomeMessageWithLogo");
        signale.success(msg);

        //When press a button
        process.stdin.on('keypress', function (key, data) {
            if (data.name === "return") { // if press enter button

                if (!isStarted) {
                    coreFunctions.selectMode();
                    isStarted = true;
                }
                
            }
        });
    })
}


