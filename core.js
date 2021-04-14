const inquirer = require("inquirer");
const signale = require("signale");
const evilScan = require("evilscan");
const ping = require('ping');
const network = require('network');
const open = require('open');
const fs = require("fs");
const dns = require('dns');
const translations = require("./translations");

/**
 * Select mode : scanListIp - scanPort
 */
function selectMode() {

    inquirer.prompt([
        {
            // parameters
            type: "list", // type
            name: "mode",
            message: translations.getPhrase("WelcomeMessage"),
            choices: [
                {
                    name: translations.getPhrase("scanListIp"),
                    value: "scanListIp",
                },
                {
                    name: translations.getPhrase("scanPort"),
                    value: "scanPort",
                },
                {
                    name: translations.getPhrase("ssh"),
                    value: "ssh",
                },
                {
                    name: translations.getPhrase("localInfo"),
                    value: "localInfo"
                },
                {
                    name: translations.getPhrase("gatewayPnlCtrl"),
                    value: "gatewayPnlCtrl"
                }
            ]
        }
    ]).then(async (answer) => { // answer contain link property ( name property of question )

        const isOnline = await checkIsOnline();

        if (isOnline) {
            if (answer.mode === "scanPort") {

                askForScanPorts(); // with error controller

            } else if (answer.mode === "scanListIp") {

               await scanListIp();

            } else if (answer.mode === "ssh") {

                sshCommand(); // with error controller

            } else if (answer.mode == "localInfo") {

                localInfo(); // with error controller

            } else if (answer.mode == "gatewayPnlCtrl") {

                openGatewayPanelControl(); // with error controller
            }
        }

    })
}

/**
 * Execute scan of ports
 */
function scanListIp() {
    return new Promise(async (resolve, reject) => {
        signale.pending(translations.getPhrase("scanningMsg"));

        //scan ip address range: 192.168.1.1 - 192.168.1.253
        for (let i = 0; i <= 253; i++) {

            //await that ping finished
            let res = await ping.promise.probe("192.168.1." + i, {
                timeout: 0.1 // timeout for ping
            });

            //if ip address is alive
            if (res.alive) {

                signale.info(res.host);

            }

            //when finish to ping all ip address
            if (i === 253) {
                signale.success(translations.getPhrase("finishMsg"));
                selectMode();

            }
        }
    })

}
/**
 * Execute ssh command
 */
function sshCommand() {

    inquirer.prompt([
        {
            // parameters
            type: "input", // type
            name: "infoDevice",
            message: translations.getPhrase("infoDevice")
        }
    ]).then(async (answer) => {

        if (answer.infoDevice !== "") {

            const info = answer.infoDevice.split("_")

            var Client = require('ssh2').Client;

            var conn = new Client();
            conn.on('ready', function () {

                console.log('Client :: ready');

                conn.shell(function (err, stream) {
                    if (err) {
                        signale.error(translations.getPhrase("errorMsg"));
                        writeLogErrorFile(err);
                        return;
                    }

                    stream.on('close', function () {
                        console.log('Stream :: close');
                        conn.end();

                    }).on('data', function (data) {
                        console.log('OUTPUT: ' + data);
                    });

                    askCommand(function repeat(command) {
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

/**
 * Get local info
 */
function localInfo() {

    signale.pending(translations.getPhrase("loadingMsg"))

    //Get my public ip address
    network.get_public_ip(function (err, publicIpAddress) {

        if (err) {
            signale.error(translations.getPhrase("errorMsg"));
            writeLogErrorFile(err);
            return;
        }

        signale.info(translations.getPhrase("publicIp") + publicIpAddress);

        //Get local ip
        network.get_private_ip(function (err, localIpAddress) {

            if (err) {
                signale.error(translations.getPhrase("errorMsg"));
                writeLogErrorFile(err);
                return;
            }

            signale.info(translations.getPhrase("localIp") + localIpAddress);

            network.get_gateway_ip(function (err, gatewayIp) {

                if (err) {
                    signale.error(translations.getPhrase("errorMsg"));
                    writeLogErrorFile(err);
                    return;
                }
                signale.info("Gateway: " + gatewayIp + "\n -----------");

                network.get_active_interface(function (err, obj) {

                    if (err) {
                        signale.error(translations.getPhrase("errorMsg"));
                        writeLogErrorFile(err);
                        return;
                    }
                    signale.success(translations.getPhrase("activeInterface"))
                    signale.info(translations.getPhrase("nameInterface") + obj.name);
                    signale.info(translations.getPhrase("ipAddress") + obj.ip_address);
                    signale.info("Mac address: " + obj.mac_address);
                    signale.info("Gateway: " + obj.gateway_ip);
                    signale.info("Netmask: " + obj.netmask);
                    signale.info(translations.getPhrase("interfaceType") + obj.type);
                    selectMode();

                });
            })

        })
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
            message: translations.getPhrase("target"), // question
            default: "127.0.0.1"
        },
        {
            // parameters
            type: "input", // type
            name: "range",
            message: translations.getPhrase("range"), // question
            default: "21-23"
        },
        {
            // parameters
            type: "input", // type
            name: "status",
            message: translations.getPhrase("status"), // question
            default: "TROU"
        }
    ]).then(async (answers) => { // answer contain link property ( name property of question )

        // scan
        await scan(answers.target, answers.range, answers.status, null);
        signale.pending(translations.getPhrase("loadingMsg"));

    })
}

/**
 * Scan ports
 * @param {*} target -> ip address or range
 * @param {*} range -> range of ports
 * @param {*} status -> status of ports
 */
async function scan(target, range, status) {

    var options = {
        target: target,
        port: range,
        status: status, // Timeout, Refused, Open, Unreachable
        banner: true
    };

    //create scanner object
    var scanner = new evilScan(options);

    //when port is scanned
    scanner.on('result', function (data) {

        // fired when item is matching options
        signale.info(translations.getPhrase("ipAddress") + data.ip);
        signale.info(translations.getPhrase("port") + data.port);
        if (data.banner !== "") {
            signale.info("Banner: " + data.banner);
        } else {
            signale.info("Banner: /");

        }
        signale.info(translations.getPhrase("statusMsg") + data.status);
        console.log("--------------------");


    });

    scanner.on('error', function (err) {
        signale.error(translations.getPhrase("errorMsg"));
        writeLogErrorFile(err);
        return;
    });

    scanner.on('done', function () {

        // finished !
        signale.success(translations.getPhrase("finishMsg"))
        selectMode();

    });

    //scan
    scanner.run();
}

/**
 * Ask next command
 * @param callback 
 */
function askCommand(callback) {
    inquirer.prompt([
        {
            // parameters
            type: "input", // type
            name: "command",
            message: translations.getPhrase("commandSsh"),
            default: "ls -l"
        }
    ]).then(async (answer) => {

        callback(answer.command);
    })
}

function openGatewayPanelControl() {

    signale.success(translations.getPhrase("loadingMsg"));

    network.get_gateway_ip(async function (err, gatewayIp) {

        if (err) {
            signale.error(translations.getPhrase("errorMsg"));
            writeLogErrorFile(err);
            return;
        }
        await open("http://" + gatewayIp);

        selectMode();
    })
}

function writeLogErrorFile(err) {

    var todayTime = new Date();
    var month = todayTime.getMonth();
    var day = todayTime.getDate();
    var year = todayTime.getFullYear();
    var hour = todayTime.getHours();
    var min = todayTime.getMinutes();
    const error = month + "/" + day + "/" + year + "-" + hour + ":" + min + "\n" + err.stack + "\n\n";

    if (!fs.existsSync("logs")){
        fs.mkdirSync("logs");
    }

    fs.appendFile("logs/logsErrors.log", error, function () { })
}

function checkIsOnline() {
    return new Promise((resolve, reject) => {
        dns.resolve('www.google.com', function (err) {
            if (err) {
                writeLogErrorFile(err);
                signale.error(translations.getPhrase("errorMsg"));
                return resolve(false);
            } else {
                return resolve(true);
            }
        }, function (err) {
            writeLogErrorFile(err);
            signale.error(translations.getPhrase("errorMsg"));
            return resolve(false);
        });
    })
}

module.exports = {
    selectMode: selectMode,
    askForScanPorts: askForScanPorts,
    scanListIp: scanListIp,
    sshCommand, sshCommand,
    localInfo: localInfo,
    scan: scan,
    askCommand: askCommand
}