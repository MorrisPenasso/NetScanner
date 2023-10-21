
module CORE {

    const inquirer: any = require("inquirer");
    const signale: any = require("signale");
    const evilScan: any = require("evilscan");
    const ping: any = require('ping');
    const network: any = require('network');
    const open: any = require('open');
    const fs: any = require("fs");
    const dns: any = require('dns');
    const wifi: any = require('node-wifi');
    const translations: any = require("./translations");

    wifi.init({
        iface: null // network interface, choose a random wifi interface if set to null
    });

    /**
     * Select mode : scanListIp - scanPort
     */
    function selectMode(): void {

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

            const isOnline: boolean = await checkIsOnline();

            if (isOnline) {
                if (answer.mode === "scanPort") {

                    askForScanPorts(); // with error controller

                } else if (answer.mode === "scanListIp") {

                    await scanListIp();

                } else if (answer.mode === "ssh") {

                    sshCommand(); // with error controller

                } else if (answer.mode === "localInfo") {

                    localInfo(); // with error controller

                } else if (answer.mode === "gatewayPnlCtrl") {

                    openGatewayPanelControl(); // with error controller
                } else if (answer.mode === "wifiList") {

                    getWifiInformations(); // with error controller
                }
            } else {
                signale.error(translations.getPhrase("errorOnline"));
                writeLogErrorFile(translations.getPhrase("errorOnline"));
                return;
            }

        })
    }

    /**
     * Execute scan of ports
     */
    function scanListIp(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            signale.pending(translations.getPhrase("scanningMsg"));

            writeLog(translations.getPhrase("time") + " " + getTime() + "\n");
            writeLog(translations.getPhrase("scanningMsg"));

            //scan ip address range: 192.168.1.1 - 192.168.1.253
            for (let i: number = 0; i <= 253; i++) {

                //await that ping finished
                let res: IPingStatus = await ping.promise.probe("192.168.1." + i, {
                    timeout: 0.1 // timeout for ping
                });

                //if ip address is alive
                if (res.alive) {

                    dns.reverse(res.host, (err: any, hostname: string) => {

                        let finalHostname: string = "";
                        if (hostname && hostname !== "") {

                            finalHostname = res.host + " - " + hostname;
                        } else {

                            finalHostname = res.host;
                        }

                        signale.info(finalHostname);
                        writeLog(finalHostname);

                    });
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
    function sshCommand(): void {

        inquirer.prompt([
            {
                // parameters
                type: "input", // type
                name: "infoDevice",
                message: translations.getPhrase("infoDevice")
            }
        ]).then(async (answer: any) => {

            const info: string = answer.infoDevice.split("_")

            //test if answers are valid
            let validIp: boolean = validateIpAddress(info[0]);

            let validFormat: boolean = answer.infoDevice.indexOf("_") != -1 && info.length > 0;

            if (answer.infoDevice !== "" && validIp && validFormat) {

                let Client: any = require('ssh2').Client;

                try {

                    var conn: any = new Client();
                    conn.on('ready', function () {

                        signale.success('Connection established...\n');
                        writeLog(translations.getPhrase("time") + " " + getTime() + "\n");
                        writeLog('SSH connection established...\n');

                        conn.shell(function (err: any, stream: any) {

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
                            }).on('data', function (data: string) {
                                console.log("" + data);
                                writeLog("" + data)
                            });

                            //when is connected, i wait 2 seconds because the client return the response for connection complete
                            setTimeout(function () {
                                askCommand(function (command: string) {
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
                } catch (error: any) {
                    signale.error(translations.getPhrase("errorMsg"));
                    writeLogErrorFile(error);
                    return;
                }
            } else {
                signale.error(translations.getPhrase("errorMsg"));
                writeLogErrorFile({ stack: "SSH Error: You have entered invalid informations" });
                return;
            }
        })
    }

    /**
     * Get local info
     */
    function localInfo(): void {

        writeLog(translations.getPhrase("time") + " " + getTime() + "\n");

        signale.pending(translations.getPhrase("loadingMsg"));
        writeLog(translations.getPhrase("loadingMsg"));

        //Get my public ip address
        network.get_public_ip(function (err: any, publicIpAddress: string) {

            if (err) {
                signale.error(translations.getPhrase("errorMsg"));
                writeLogErrorFile(err);
                return;
            }

            signale.info(translations.getPhrase("publicIp") + publicIpAddress);
            writeLog(translations.getPhrase("publicIp") + publicIpAddress);

            //Get local ip
            network.get_private_ip(function (err: any, localIpAddress: string) {

                if (err) {
                    signale.error(translations.getPhrase("errorMsg"));
                    writeLogErrorFile(err);
                    return;
                }

                signale.info(translations.getPhrase("localIp") + localIpAddress);
                writeLog(translations.getPhrase("localIp") + localIpAddress);

                network.get_gateway_ip(function (err: any, gatewayIp: string) {

                    if (err) {
                        signale.error(translations.getPhrase("errorMsg"));
                        writeLogErrorFile(err);
                        return;
                    }
                    signale.info("Gateway: " + gatewayIp + "\n -----------");
                    writeLog("Gateway: " + gatewayIp + "\n -----------");

                    network.get_active_interface(function (err: any, obj: INetworkInformations) {

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
    function askForScanPorts(): void {
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
        ]).then(async (answers: any) => { // answer contain link property ( name property of question )

            let error: boolean = false;

            //test if answers are valid
            let validIp: boolean = validateIpAddress(answers.target);

            let validRange: boolean = validateRange(answers.range);

            let validStatus: boolean = validateStatus(answers.status);

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

            if (!error) {
                // scan
                await scan(answers.target, answers.range, answers.status);
                signale.pending(translations.getPhrase("scanPort"));
            }
        })
    }

    /**
     * Scan ports
     * @param {*} target -> ip address or range
     * @param {*} range -> range of ports
     * @param {*} status -> status of ports
     */
    async function scan(target: string, range: string, status: string) {

        writeLog(translations.getPhrase("time") + " " + getTime() + "\n");

        const options: IScannerOptions = {
            target: target,
            port: range,
            status: status, // Timeout, Refused, Open, Unreachable
            banner: true
        };

        //create scanner object
        const scanner: any = new evilScan(options);

        //when port is scanned
        scanner.on('result', function (data: IScannerResult) {

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

        scanner.on('error', function (err: any) {
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
    function askCommand(callback: (command:string) => void) {
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
    function openGatewayPanelControl(): void {

        signale.success(translations.getPhrase("loadingMsg"));

        network.get_gateway_ip(async function (err: any, gatewayIp: string) {

            if (err) {
                signale.error(translations.getPhrase("errorMsg"));
                writeLogErrorFile(err);
                return;
            }
            await open("http://" + gatewayIp);

            selectMode();
        })
    }

    async function getWifiInformations(): Promise<void>  {

        writeLog(translations.getPhrase("time") + " " + getTime() + "\n");

        writeLog("\n" + translations.getPhrase("scanningWifi"));

        signale.pending(translations.getPhrase("scanningWifi"));

        const networks: ISignaleWifi[] = await getWifiList();

        if (networks) {

            for (let i: number = 0; i < networks.length; i++) {

                const singleWifi: ISignaleWifi = networks[i];

                if (singleWifi && singleWifi.ssid) {
                    signale.info(translations.getPhrase("ssid") + singleWifi.ssid);
                    signale.info(translations.getPhrase("mac") + singleWifi.mac);
                    signale.info(translations.getPhrase("channel") + singleWifi.channel);
                    signale.info(translations.getPhrase("frequency") + singleWifi.frequency);
                    signale.info(translations.getPhrase("signaleLevel") + singleWifi.signal_level);
                    signale.info(translations.getPhrase("quality") + singleWifi.quality);
                    signale.info(translations.getPhrase("security") + singleWifi.security);
                    signale.info(translations.getPhrase("securityProtocol") + singleWifi.security_flags);
                    signale.info(translations.getPhrase("networkMode") + (singleWifi.mode ? singleWifi.mode : " "));
                    console.log("--------------------");
                    await writeLog(translations.getPhrase("ssid") + singleWifi.ssid);
                    await writeLog(translations.getPhrase("mac") + singleWifi.mac);
                    await writeLog(translations.getPhrase("channel") + singleWifi.channel);
                    await writeLog(translations.getPhrase("frequency") + singleWifi.frequency);
                    await writeLog(translations.getPhrase("signaleLevel") + singleWifi.signal_level);
                    await writeLog(translations.getPhrase("quality") + singleWifi.quality);
                    await writeLog(translations.getPhrase("security") + singleWifi.security);
                    await writeLog(translations.getPhrase("securityProtocol") + singleWifi.security_flags);
                    await writeLog(translations.getPhrase("networkMode") + (singleWifi.mode ? singleWifi.mode : " "));
                    await writeLog("--------------------");

                }
            }
            writeLog(translations.getPhrase("finishMsg") + "\n")
            signale.success(translations.getPhrase("finishMsg"));
            selectMode();
        }
    }

    function getWifiList(): Promise<ISignaleWifi[]> {
        return new Promise<ISignaleWifi[]>((resolve, reject) => {

            // Scan networks
            wifi.scan((error: any, networks: ISignaleWifi[]) => {
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
    function getTime(): string {

        const todayTime: Date = new Date();
        const hour: number = todayTime.getHours();
        const min: number = todayTime.getMinutes();

        return hour + ":" + min;

    }

    /**
     * Write log
     * @param data -> string to write
     */
    function writeLog(data: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            const todayTime: Date = new Date();
            const month: number = todayTime.getMonth() + 1;
            const day: number = todayTime.getDate();
            const year: number = todayTime.getFullYear();

            const fileName: string = "logs/log_" + month + "_" + day + "_" + year + ".log";

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
    function writeLogErrorFile(err: any): void {

        var todayTime: Date = new Date();
        var month: number = todayTime.getMonth();
        var day: number = todayTime.getDate();
        var year: number = todayTime.getFullYear();

        const error: string = month + "/" + day + "/" + year + "-" + getTime() + "\n" + err.stack + "\n\n";

        if (!fs.existsSync("logs")) {
            fs.mkdirSync("logs");
        }

        fs.appendFile("logs/logsErrors.log", error, function () { })
    }

    /**
     * Control if device is online
    */
    function checkIsOnline(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            dns.resolve('www.google.com', function (err: any) {
                if (err) {
                    writeLogErrorFile(err);
                    signale.error(translations.getPhrase("errorMsg"));
                    resolve(false);
                } else {
                    resolve(true);
                }
            }, function (err: any) {
                writeLogErrorFile(err);
                signale.error(translations.getPhrase("errorMsg"));
                resolve(false);
            });
        })
    }

    /**
     * Control if ip address is valid
     * @param ipAddress -> ip address -> "192.168.1.1"
     * @returns boolean true/false 
     */
    function validateIpAddress(ipAddress: string): boolean {
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
    function validateRange(range: string): boolean {

        let startRange: string = range.substring(0, range.indexOf("-"));
        let endRange: string = range.substring(range.indexOf("-") + 1, range.length);

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
    function validateStatus(status: string): boolean {

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
        sshCommand: sshCommand,
        localInfo: localInfo,
        scan: scan,
        askCommand: askCommand
    }
}