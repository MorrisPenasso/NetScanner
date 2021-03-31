const asciify = require("asciify-image");
const coreFunctions = require("./core");

showLogo();

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

        coreFunctions.selectMode();       
    })
}


