const asciify = require("asciify-image");
const coreFunctions = require("./core");
const translations = require("./translations");
const chalkAnimation = require('chalk-animation');
const pjson = require('./package.json');

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
        var msg = translations.getPhrase("WelcomeMessageWithLogo") + pjson.version + "\n";
        const msgRainbow1 = chalkAnimation.rainbow(msg); // Animation starts

        setTimeout(() => {
            coreFunctions.selectMode();
            msgRainbow1.stop();
        }, 5000)

    })
}


