var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var CORE;
(function (CORE) {
    var inquirer = require("inquirer");
    var signale = require("signale");
    var evilScan = require("evilscan");
    var ping = require('ping');
    var network = require('network');
    var open = require('open');
    var fs = require("fs");
    var dns = require('dns');
    var wifi = require('node-wifi');
    var translations = require("./translations");
    wifi.init({
        iface: null // network interface, choose a random wifi interface if set to null
    });
    /**
     * Select mode : scanListIp - scanPort
     */
    function selectMode() {
        var _this = this;
        inquirer.prompt([
            {
                // parameters
                type: "list",
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
        ]).then(function (answer) { return __awaiter(_this, void 0, void 0, function () {
            var isOnline;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, checkIsOnline()];
                    case 1:
                        isOnline = _a.sent();
                        if (!isOnline) return [3 /*break*/, 6];
                        if (!(answer.mode === "scanPort")) return [3 /*break*/, 2];
                        askForScanPorts(); // with error controller
                        return [3 /*break*/, 5];
                    case 2:
                        if (!(answer.mode === "scanListIp")) return [3 /*break*/, 4];
                        return [4 /*yield*/, scanListIp()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        if (answer.mode === "ssh") {
                            sshCommand(); // with error controller
                        }
                        else if (answer.mode === "localInfo") {
                            localInfo(); // with error controller
                        }
                        else if (answer.mode === "gatewayPnlCtrl") {
                            openGatewayPanelControl(); // with error controller
                        }
                        else if (answer.mode === "wifiList") {
                            getWifiInformations(); // with error controller
                        }
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        signale.error(translations.getPhrase("errorOnline"));
                        writeLogErrorFile(translations.getPhrase("errorOnline"));
                        return [2 /*return*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
    }
    /**
     * Execute scan of ports
     */
    function scanListIp() {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _loop_1, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        signale.pending(translations.getPhrase("scanningMsg"));
                        writeLog(translations.getPhrase("time") + " " + getTime() + "\n");
                        writeLog(translations.getPhrase("scanningMsg"));
                        _loop_1 = function (i) {
                            var res;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, ping.promise.probe("192.168.1." + i, {
                                            timeout: 0.1 // timeout for ping
                                        })];
                                    case 1:
                                        res = _b.sent();
                                        //if ip address is alive
                                        if (res.alive) {
                                            dns.reverse(res.host, function (err, hostname) {
                                                var finalHostname = "";
                                                if (hostname && hostname !== "") {
                                                    finalHostname = res.host + " - " + hostname;
                                                }
                                                else {
                                                    finalHostname = res.host;
                                                }
                                                signale.info(finalHostname);
                                                writeLog(finalHostname);
                                            });
                                        }
                                        //when finish to ping all ip address
                                        if (i === 253) {
                                            signale.success(translations.getPhrase("finishMsg"));
                                            writeLog(translations.getPhrase("finishMsg") + "\n");
                                            selectMode();
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        };
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i <= 253)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(i)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    }
    /**
     * Execute ssh command
     */
    function sshCommand() {
        var _this = this;
        inquirer.prompt([
            {
                // parameters
                type: "input",
                name: "infoDevice",
                message: translations.getPhrase("infoDevice")
            }
        ]).then(function (answer) { return __awaiter(_this, void 0, void 0, function () {
            var info, validIp, validFormat, Client, conn;
            return __generator(this, function (_a) {
                info = answer.infoDevice.split("_");
                validIp = validateIpAddress(info[0]);
                validFormat = answer.infoDevice.indexOf("_") != -1 && info.length > 0;
                if (answer.infoDevice !== "" && validIp && validFormat) {
                    Client = require('ssh2').Client;
                    try {
                        conn = new Client();
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
                                    writeLog("Connection closed\n");
                                    conn.end();
                                    //when stream receive data
                                }).on('data', function (data) {
                                    console.log("" + data);
                                    writeLog("" + data);
                                });
                                //when is connected, i wait 2 seconds because the client return the response for connection complete
                                setTimeout(function () {
                                    askCommand(function (command) {
                                        stream.end(command + "\nexit\n");
                                        setTimeout(function () {
                                            selectMode();
                                        }, 500);
                                    });
                                }, 2000);
                            });
                        }).connect({
                            host: info[0],
                            port: 22,
                            username: info[1],
                            password: info[2]
                        });
                    }
                    catch (error) {
                        signale.error(translations.getPhrase("errorMsg"));
                        writeLogErrorFile(error);
                        return [2 /*return*/];
                    }
                }
                else {
                    signale.error(translations.getPhrase("errorMsg"));
                    writeLogErrorFile({ stack: "SSH Error: You have entered invalid informations" });
                    return [2 /*return*/];
                }
                return [2 /*return*/];
            });
        }); });
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
                        signale.success(translations.getPhrase("activeInterface"));
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
                });
            });
        });
    }
    /**
     * questions for scan ports
     */
    function askForScanPorts() {
        var _this = this;
        inquirer.prompt([
            {
                // parameters
                type: "input",
                name: "target",
                message: translations.getPhrase("target"),
                default: "127.0.0.1"
            },
            {
                // parameters
                type: "input",
                name: "range",
                message: translations.getPhrase("range"),
                default: "21-23"
            },
            {
                // parameters
                type: "input",
                name: "status",
                message: translations.getPhrase("status"),
                default: "TROU"
            }
        ]).then(function (answers) { return __awaiter(_this, void 0, void 0, function () {
            var error, validIp, validRange, validStatus;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        error = false;
                        validIp = validateIpAddress(answers.target);
                        validRange = validateRange(answers.range);
                        validStatus = validateStatus(answers.status);
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
                        if (!!error) return [3 /*break*/, 2];
                        // scan
                        return [4 /*yield*/, scan(answers.target, answers.range, answers.status)];
                    case 1:
                        // scan
                        _a.sent();
                        signale.pending(translations.getPhrase("scanPort"));
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); });
    }
    /**
     * Scan ports
     * @param {*} target -> ip address or range
     * @param {*} range -> range of ports
     * @param {*} status -> status of ports
     */
    function scan(target, range, status) {
        return __awaiter(this, void 0, void 0, function () {
            var options, scanner;
            return __generator(this, function (_a) {
                writeLog(translations.getPhrase("time") + " " + getTime() + "\n");
                options = {
                    target: target,
                    port: range,
                    status: status,
                    banner: true
                };
                scanner = new evilScan(options);
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
                    }
                    else {
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
                    signale.success(translations.getPhrase("finishMsg"));
                    writeLog("\n" + translations.getPhrase("finishMsg") + "\n");
                    selectMode();
                });
                //scan
                scanner.run();
                return [2 /*return*/];
            });
        });
    }
    /**
     * Ask next command
     * @param callback
     */
    function askCommand(callback) {
        var _this = this;
        inquirer.prompt([
            {
                // parameters
                type: "input",
                name: "command",
                message: translations.getPhrase("commandSsh"),
                default: "ls -l"
            }
        ]).then(function (answer) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                callback(answer.command);
                return [2 /*return*/];
            });
        }); });
    }
    /**
     * Open gateway panel control on you default browser
     */
    function openGatewayPanelControl() {
        signale.success(translations.getPhrase("loadingMsg"));
        network.get_gateway_ip(function (err, gatewayIp) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (err) {
                                signale.error(translations.getPhrase("errorMsg"));
                                writeLogErrorFile(err);
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, open("http://" + gatewayIp)];
                        case 1:
                            _a.sent();
                            selectMode();
                            return [2 /*return*/];
                    }
                });
            });
        });
    }
    function getWifiInformations() {
        return __awaiter(this, void 0, void 0, function () {
            var networks, i, singleWifi;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        writeLog(translations.getPhrase("time") + " " + getTime() + "\n");
                        writeLog("\n" + translations.getPhrase("scanningWifi"));
                        signale.pending(translations.getPhrase("scanningWifi"));
                        return [4 /*yield*/, getWifiList()];
                    case 1:
                        networks = _a.sent();
                        if (!networks) return [3 /*break*/, 15];
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < networks.length)) return [3 /*break*/, 14];
                        singleWifi = networks[i];
                        if (!(singleWifi && singleWifi.ssid)) return [3 /*break*/, 13];
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
                        return [4 /*yield*/, writeLog(translations.getPhrase("ssid") + singleWifi.ssid)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, writeLog(translations.getPhrase("mac") + singleWifi.mac)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, writeLog(translations.getPhrase("channel") + singleWifi.channel)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, writeLog(translations.getPhrase("frequency") + singleWifi.frequency)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, writeLog(translations.getPhrase("signaleLevel") + singleWifi.signal_level)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, writeLog(translations.getPhrase("quality") + singleWifi.quality)];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, writeLog(translations.getPhrase("security") + singleWifi.security)];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, writeLog(translations.getPhrase("securityProtocol") + singleWifi.security_flags)];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, writeLog(translations.getPhrase("networkMode") + (singleWifi.mode ? singleWifi.mode : " "))];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, writeLog("--------------------")];
                    case 12:
                        _a.sent();
                        _a.label = 13;
                    case 13:
                        i++;
                        return [3 /*break*/, 2];
                    case 14:
                        writeLog(translations.getPhrase("finishMsg") + "\n");
                        signale.success(translations.getPhrase("finishMsg"));
                        selectMode();
                        _a.label = 15;
                    case 15: return [2 /*return*/];
                }
            });
        });
    }
    function getWifiList() {
        return new Promise(function (resolve, reject) {
            // Scan networks
            wifi.scan(function (error, networks) {
                if (error) {
                    signale.error(translations.getPhrase("errorMsg"));
                    writeLogErrorFile(error);
                    resolve(null);
                }
                else {
                    resolve(networks);
                }
            });
        });
    }
    /**
     * Get time
     * @returns time -> "12:30"
     */
    function getTime() {
        var todayTime = new Date();
        var hour = todayTime.getHours();
        var min = todayTime.getMinutes();
        return hour + ":" + min;
    }
    /**
     * Write log
     * @param data -> string to write
     */
    function writeLog(data) {
        return new Promise(function (resolve, reject) {
            var todayTime = new Date();
            var month = todayTime.getMonth() + 1;
            var day = todayTime.getDate();
            var year = todayTime.getFullYear();
            var fileName = "logs/log_" + month + "_" + day + "_" + year + ".log";
            if (!fs.existsSync("logs")) {
                fs.mkdirSync("logs");
            }
            fs.appendFile(fileName, data + "\n", function () { });
            resolve();
        });
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
        var error = month + "/" + day + "/" + year + "-" + getTime() + "\n" + err.stack + "\n\n";
        if (!fs.existsSync("logs")) {
            fs.mkdirSync("logs");
        }
        fs.appendFile("logs/logsErrors.log", error, function () { });
    }
    /**
     * Control if device is online
    */
    function checkIsOnline() {
        return new Promise(function (resolve, reject) {
            dns.resolve('www.google.com', function (err) {
                if (err) {
                    writeLogErrorFile(err);
                    signale.error(translations.getPhrase("errorMsg"));
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            }, function (err) {
                writeLogErrorFile(err);
                signale.error(translations.getPhrase("errorMsg"));
                resolve(false);
            });
        });
    }
    /**
     * Control if ip address is valid
     * @param ipAddress -> ip address -> "192.168.1.1"
     * @returns boolean true/false
     */
    function validateIpAddress(ipAddress) {
        if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipAddress)) {
            return (true);
        }
        return (false);
    }
    /**
     * Control if port range is valid
     * @param range -> range ports -> 0-655
     * @returns boolean true/false
     */
    function validateRange(range) {
        var startRange = range.substring(0, range.indexOf("-"));
        var endRange = range.substring(range.indexOf("-") + 1, range.length);
        //if contain "-" character
        if (range.indexOf("-") !== -1) {
            if (/[0-6]/.test(startRange)) {
                if (/[0-6]/.test(endRange)) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else {
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
        }
        else {
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
    };
})(CORE || (CORE = {}));
//# sourceMappingURL=core.js.map