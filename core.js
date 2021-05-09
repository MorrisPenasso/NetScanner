const inquirer = require("inquirer");
const signale = require("signale");
const evilScan = require("evilscan");
const ping = require('ping');
const network = require('network');
const open = require('open');
const fs = require("fs");
const dns = require('dns');
const wifi = require('node-wifi');
const translations = require("./translations");

wifi.init({
    iface: null // network interface, choose a random wifi interface if set to null
});

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
                },
                {
                    name: translations.getPhrase("getWifiList"),
                    value: "wifiList"
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
            } else if (answer.mode == "wifiList") {

                getWifiInformations(); // with error controller
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

        writeLog(translations.getPhrase("time") + " " + getTime() + "\n");
        writeLog(translations.getPhrase("scanningMsg"));

        //scan ip address range: 192.168.1.1 - 192.168.1.253
        for (let i = 0; i <= 253; i++) {

            //await that ping finished
            let res = await ping.promise.probe("192.168.1." + i, {
                timeout: 0.1 // timeout for ping
            });

            //if ip address is alive
            if (res.alive) {

                signale.info(res.host);
                writeLog(res.host);

            }

            //when finish to ping all ip address
            if (i === 253) {
                signale.success(translations.getPhrase("finishMsg"));
                writeLog(translations.getPhrase("finishMsg") + "\n")
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
        
        const info = answer.infoDevice.split("_")

        //test if answers are valid
        let validIp = validateIpAddress(info[0]);

        let validFormat = answer.infoDevice.indexOf("_") != -1 && info.length > 0;

        if (answer.infoDevice !== "" && validIp && validFormat) {

            var Client = require('ssh2').Client;

            var conn = new Client();
            conn.on('ready', function () {

                signale.success('Connection established...\n');
                writeLog(translations.getPhrase("time") + " " + getTime() + "\n");
                writeLog('SSH connection established...\n');

                conn.shell(function (err, stream) {

                    //If receive error when start connection
                    if (err) {
                        signale.error(translations.getPhrase("errorMsg"));
                        writeLogErrorFile(err);
                        return;
                    }

                    //when stream is closed
                    stream.on('close', function () {
                        signale.info('Connection closed\n');
                        writeLog("Connection closed\n")
                        conn.end();

                        //when stream receive data
                    }).on('data', function (data) {
                        console.log("" + data);
                        writeLog("" + data)
                    });

                    //when is connected, i wait 2 seconds because the client return the response for connection complete
                    setTimeout(function () {
                        askCommand(function (command) {
                            stream.end(command + "\nexit\n");

                            setTimeout(function () {
                                selectMode();
                            }, 500)
                        })
                    }, 2000)
                })
            }).connect({
                host: info[0],
                port: 22,
                username: info[1],
                password: info[2]
            });
        } else  {
            signale.error(translations.getPhrase("errorMsg"));
            writeLogErrorFile({ stack: "SSH Error: You have entered invalid informations" });
            error = true;
        }
    })
}

/**
 * Get local info
 */
function localInfo() {

    writeLog(translations.getPhrase("time") + " " + getTime() + "\n");

    signale.pending(translations.getPhrase("loadingMsg"));
    writeLog(translations.getPhrase("loadingMsg"));

    //Get my public ip address
    network.get_public_ip(function (err, publicIpAddress) {

        if (err) {
            signale.error(translations.getPhrase("errorMsg"));
            writeLogErrorFile(err);
            return;
        }

        signale.info(translations.getPhrase("publicIp") + publicIpAddress);
        writeLog(translations.getPhrase("publicIp") + publicIpAddress);

        //Get local ip
        network.get_private_ip(function (err, localIpAddress) {

            if (err) {
                signale.error(translations.getPhrase("errorMsg"));
                writeLogErrorFile(err);
                return;
            }

            signale.info(translations.getPhrase("localIp") + localIpAddress);
            writeLog(translations.getPhrase("localIp") + localIpAddress);

            network.get_gateway_ip(function (err, gatewayIp) {

                if (err) {
                    signale.error(translations.getPhrase("errorMsg"));
                    writeLogErrorFile(err);
                    return;
                }
                signale.info("Gateway: " + gatewayIp + "\n -----------");
                writeLog("Gateway: " + gatewayIp + "\n -----------");

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

                    writeLog(translations.getPhrase("activeInterface"));
                    writeLog(translations.getPhrase("nameInterface") + obj.name);
                    writeLog(translations.getPhrase("ipAddress") + obj.ip_address);
                    writeLog("Mac address: " + obj.mac_address);
                    writeLog("Gateway: " + obj.gateway_ip);
                    writeLog("Netmask: " + obj.netmask);
                    writeLog(translations.getPhrase("interfaceType") + obj.type);
                    writeLog(translations.getPhrase("finishMsg") + "\n");

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

        let error = false;

        //test if answers are valid
        let validIp = validateIpAddress(answers.target);

        let validRange = validateRange(answers.range);

        let validStatus = validateStatus(answers.status);

        if (!validIp) {
            signale.error(translations.getPhrase("errorMsg"));
            writeLogErrorFile({ stack: "You have entered an invalid IP address!" });
            error = true;
        } 
        
        if (!validRange) {
            signale.error(translations.getPhrase("errorMsg"));
            writeLogErrorFile({ stack: "You have entered an invalid range!" });
            error = true;
        } 
        if (!validStatus) {
            signale.error(translations.getPhrase("errorMsg"));
            writeLogErrorFile({ stack: "You have entered an invalid status!" });
            error = true;
        }
        
        if(!error)    {
            // scan
            await scan(answers.target, answers.range, answers.status, null);
            signale.pending(translations.getPhrase("loadingMsg"));
        }
    })
}

/**
 * Scan ports
 * @param {*} target -> ip address or range
 * @param {*} range -> range of ports
 * @param {*} status -> status of ports
 */
async function scan(target, range, status) {
    
    writeLog(translations.getPhrase("time") + " " + getTime() + "\n");

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
        writeLog(translations.getPhrase("ipAddress") + data.ip);

        signale.info(translations.getPhrase("port") + data.port);
        writeLog(translations.getPhrase("port") + data.port);

        if (data.banner !== "") {
            signale.info("Banner: " + data.banner);
            writeLog("Banner: " + data.banner);
        } else {
            signale.info("Banner: /");
            writeLog("Banner: /");

        }
        signale.info(translations.getPhrase("statusMsg") + data.status);
        console.log("--------------------");

        writeLog(translations.getPhrase("statusMsg") + data.status);
        writeLog("--------------------");
    });

    scanner.on('error', function (err) {
        signale.error(translations.getPhrase("errorMsg"));
        writeLogErrorFile(err);
        return;
    });

    scanner.on('done', function () {

        // finished !
        signale.success(translations.getPhrase("finishMsg"))
        writeLog("\n" + translations.getPhrase("finishMsg") + "\n");

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

/**
 * Open gateway panel control on you default browser
 */
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

async function getWifiInformations() {

    writeLog(translations.getPhrase("time") + " " + getTime() + "\n");

    writeLog("\n" + translations.getPhrase("scanningWifi"));

    signale.pending(translations.getPhrase("scanningWifi"));

    const networks = await getWifiList();

    if (networks) {

        for (let i = 0; i < networks.length; i++) {

            const singleWifi = networks[i];

            if (singleWifi && singleWifi.ssid) {
                signale.info(translations.getPhrase("ssid") + singleWifi.ssid);
                signale.info(translations.getPhrase("mac") + singleWifi.mac);
                signale.info(translations.getPhrase("channel") + singleWifi.channel);
                signale.info(translations.getPhrase("frequency") + singleWifi.frequency);
                signale.info(translations.getPhrase("signaleLevel") + singleWifi.signal_level);
                signale.info(translations.getPhrase("quality") + singleWifi.quality);
                signale.info(translations.getPhrase("security") + singleWifi.security);
                signale.info(translations.getPhrase("securityProtocol") + singleWifi.security_flags);
                signale.info(translations.getPhrase("networkMode") + singleWifi.mode);
                console.log("--------------------");
                await writeLog(translations.getPhrase("ssid") + singleWifi.ssid);
                await writeLog(translations.getPhrase("mac") + singleWifi.mac);
                await writeLog(translations.getPhrase("channel") + singleWifi.channel);
                await writeLog(translations.getPhrase("frequency") + singleWifi.frequency);
                await writeLog(translations.getPhrase("signaleLevel") + singleWifi.signal_level);
                await writeLog(translations.getPhrase("quality") + singleWifi.quality);
                await writeLog(translations.getPhrase("security") + singleWifi.security);
                await writeLog(translations.getPhrase("securityProtocol") + singleWifi.security_flags);
                await writeLog(translations.getPhrase("networkMode") + singleWifi.mode);
                await writeLog("--------------------");

            }
        }
        writeLog(translations.getPhrase("finishMsg") + "\n")
        signale.success(translations.getPhrase("finishMsg"));
        selectMode();
    }
}

function getWifiList() {
    return new Promise((resolve, reject) => {

        // Scan networks
        wifi.scan((error, networks) => {
            if (error) {
                signale.error(translations.getPhrase("errorMsg"));
                writeLogErrorFile(error);
                resolve(null);
            } else {
                resolve(networks);
            }
        })
    })
}

/**
 * Get time
 * @returns time -> "12:30" 
 */
function getTime()  {

    const todayTime = new Date();

    const hour = todayTime.getHours();
    const min = todayTime.getMinutes();

    return hour + ":" + min;

}

/**
 * Write log
 * @param data -> string to write
 */
function writeLog(data) {
    return new Promise((resolve, reject) => {

        const todayTime = new Date();
        const month = todayTime.getMonth() + 1;
        const day = todayTime.getDate();
        const year = todayTime.getFullYear();

        const fileName = "logs/log_" + month + "_" + day + "_" + year + ".log";

        if (!fs.existsSync("logs")) {
            fs.mkdirSync("logs");
        }

        fs.appendFile(fileName, data + "\n", function () { })
        resolve();
    })
}

/**
 * Write log error
 * @param err -> Error object
 */
function writeLogErrorFile(err) {

    var todayTime = new Date();
    var month = todayTime.getMonth();
    var day = todayTime.getDate();
    var year = todayTime.getFullYear();

    const error = month + "/" + day + "/" + year + "-" + getTime() + "\n" + err.stack + "\n\n";

    if (!fs.existsSync("logs")){
        fs.mkdirSync("logs");
    }

    fs.appendFile("logs/logsErrors.log", error, function () { })
}

/**
 * Control if device is online
*/
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

/**
 * Control if ip address is valid
 * @param ipAddress -> ip address -> "192.168.1.1"
 * @returns boolean true/false 
 */
function validateIpAddress(ipAddress) {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipAddress)) {
        return (true)
    }
    return (false)
}

/**
 * Control if port range is valid
 * @param range -> range ports -> 0-655
 * @returns boolean true/false 
 */
function validateRange(range)    {
    
    let startRange = range.substring(0, range.indexOf("-"));
    let endRange = range.substring(range.indexOf("-") + 1, range.length);

    //if contain "-" character
    if (range.indexOf("-") !== -1) {
        if (/[0-6]/.test(startRange)) {
            if (/[0-6]/.test(endRange)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }

    } else {
        return false;
    }
}

/**
 * Control if status ports is valid
 * @param {*} status -> String of status -> "Open", "Refused"...
 * @returns boolean true/false
 */
function validateStatus(status) {
    
    if (status.toUpperCase().indexOf("OPEN") != -1 || status.toUpperCase().indexOf("TIMEOUT") != -1 || status.toUpperCase().indexOf("REFUSED") != -1 || status.toUpperCase().indexOf("UNREACHABLE") != -1) {
        return true;
    } else {
        return false;
    }
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