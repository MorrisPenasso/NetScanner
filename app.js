const asciify = require("asciify-image"); // library to create asciify images
const coreFunctions = require("./core");
const translations = require("./translations");
const chalkAnimation = require('chalk-animation'); // library to create animations
const keypress = require('keypress'); // library to detect key press

//Print message for packages
const msgRainbow2 = chalkAnimation.rainbow(translations.getPhrase("packageInstalled")); // Animation starts
setTimeout(() => {
    showLogo();
    msgRainbow2.stop();
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
        const msgRainbow1 = chalkAnimation.rainbow(msg); // Animation starts

        // make `process.stdin` begin emitting "keypress" events
        keypress(process.stdin);

        // listen for the "keypress" event
        process.stdin.on('keypress', function (ch, key) {
            if(key.name === "enter")  {
                coreFunctions.selectMode();
                msgRainbow1.stop();
            }
        });
    })
}


