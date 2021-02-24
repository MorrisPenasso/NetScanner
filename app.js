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

/**
 * Select mode : scanListIp - scanPort
 */
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
                },
                {
                    name: "SSH connection",
                    value: "ssh",
                }
            ]
        }
    ]).then(async (answer) => { // answer contain link property ( name property of question )

        if(answer.mode === "scanPort")    {
            askForScanPorts();
        } else if(answer.mode === "scanListIp") {

            signale.pending("Scanning...");

            //scan ip address range: 192.168.1.1 - 192.168.1.253
            for (let i = 0; i <= 253; i++) {

                //await that ping finished
                let res = await ping.promise.probe("192.168.1." + i, {
                    timeout: 0.1 // timeout for ping
                });

                //if ip address is alive
                if(res.alive)   {
                    signale.info(res.host);
                }

                //when finish to ping all ip address
                if(i === 253)   {
                    signale.success("Finished");
                    selectMode();
                }
            }

        } else if (answer.mode === "ssh") {

            inquirer.prompt([
                {
                    // parameters
                    type: "input", // type
                    name: "infoDevice",
                    message: "Write Ip Address, username and password. Example: 192.168.1.10_username123_password123"
                }
            ]).then(async (answer) => {

                if (answer.infoDevice !== "") {

                    const info = answer.infoDevice.split("_")

                    var Client = require('ssh2').Client;

                    var conn = new Client();
                    conn.on('ready', function () {

                        console.log('Client :: ready');

                        conn.shell(function (err, stream) {
                            if (err) throw err;

                            stream.on('close', function () {
                                console.log('Stream :: close');
                                conn.end();

                            }).on('data', function (data) {
                                console.log('OUTPUT: ' + data);
                            });

                            askCommand(function repeat(command) {
                                console.log(command)
                                //stream.end('ls -l\nexit\n');
                                stream.end(command + "\n");
                                
                                //TODO - Multiples commands
                                /**if(command !== "exit")  {
                                    askCommand(repeat)
                                } else  {
                                    stream.end('exit\n');
                                }
                                */
                            });
                        });
                    })
                        .connect({
                            host: info[0],
                            port: 22,
                            username: info[1],
                            password: info[2]
                        });

                }
            })
        }

    })
}


/**
 * questions for scan ports
 */
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

        // scan
        scan(answers.target, answers.range, answers.status);
        signale.pending("Scanning...");

    })
}
/**
 * Scan ports
 * @param {*} target -> ip address or range
 * @param {*} range -> range of ports
 * @param {*} status -> status of ports
 */
function scan(target, range, status) {
    
    var options = {
        target: target,
        port: range,
        status: status, // Timeout, Refused, Open, Unreachable
        banner:true
    };
    
    //create scanner object
    var scanner = new evilScan(options);
    
    //when port is scanned
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
        
    //scan
    scanner.run();
}

function askCommand(callback) {
    inquirer.prompt([
        {
            // parameters
            type: "input", // type
            name: "command",
            message: "What the command that would you like to launch? Write 'exit' for exit",
            default: "ls -l"
        }
    ]).then(async (answer) => {

        callback(answer.command);
    })
}