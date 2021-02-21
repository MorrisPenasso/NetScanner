const inquirer = require("inquirer");
const signale = require("signale");
const evilScan = require("evilscan");
const asciify = require("asciify-image");
var ping = require('ping');

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

        selectMode();        
    })
}

function selectMode()   {
    inquirer.prompt([
        {
            // parameters
            type: "list", // type
            name: "mode",
            message: "What do you do?",
            choices: [
                {
                    name: "Get list of active ip address",
                    value: "scanListIp",
                },
                {
                    name: "Scan ports",
                    value: "scanPort",
                }
            ]
        }
    ]).then(async (answer) => { // answer contain link property ( name property of question )

        if(answer.mode === "scanPort")    {
            askForScanPorts();
        } else if(answer.mode === "scanListIp") {

            signale.pending("Scanning...");

            for (let i = 0; i <= 253; i++) {
                let res = await ping.promise.probe("192.168.1." + i, {
                    timeout: 0.1
                });
                if(res.alive)   {
                    signale.info(res.host);
                }
                if(i === 253)   {
                    signale.success("Finished");
                    selectMode();
                }
            }
    
            
        }

    })
}

function askForScanPorts() {
    inquirer.prompt([
        {
            // parameters
            type: "input", // type
            name: "target",
            message: "What is the IP address to scan? Ctrl+c to exit", // question
            default: "127.0.0.1"
        },
        {
            // parameters
            type: "input", // type
            name: "range",
            message: "What is the range of port? Ctrl+c to exit", // question
            default: "21-23"
        },
        {
            // parameters
            type: "input", // type
            name: "status",
            message: "What status would you like to find? Timeout, Refused, Open, Unreachable - Ctrl+c to exit", // question
            default: "TROU"
        }
    ]).then((answers) => { // answer contain link property ( name property of question )


        scan(answers.target, answers.range, answers.status);
        signale.pending("Scanning...");

    })
}

function scan(target, range, status) {
    
    var options = {
        target: target,
        port: range,
        status: status, // Timeout, Refused, Open, Unreachable
        banner:true
    };
    
    var scanner = new evilScan(options);
    
    scanner.on('result',function(data) {
        // fired when item is matching options
        signale.info("Ip address: " + data.ip);
        signale.info("Port: " + data.port);
        if (data.banner !== "") {
            signale.info("Banner: " + data.banner);
        } else {
            signale.info("Banner: /");

        }
        signale.info("Status: " + data.status);
        console.log("--------------------")
        
    });
    
    scanner.on('error',function(err) {
        throw new Error(data.toString());
    });
    
    scanner.on('done',function() {
        // finished !
        signale.success("Finished!")
        selectMode();
    });
    
    scanner.run();
}