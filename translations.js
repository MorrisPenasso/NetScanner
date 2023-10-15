const pjson = require('./package.json');

var lang = "";

if (process.env.LANG) {
    lang = process.env.LANG.substring(0, process.env.LANG.indexOf("_")); // get local language
} else {
    lang = "en";
}

var listPhrases = [];

if (lang === "it") {

    listPhrases.push(
        {
            name: "packageInstalled",
            msg: "Controllo pacchetti terminato!"

        },
        {
            name: "WelcomeMessageOnStart",
            msg: "Benvenuto in NetScanner! Versione: " + pjson.version + "\n"

        },

        //START COMMANDS
        {
            name: "WelcomeMessage",
            msg: "Cosa vuoi fare? Ctrl+c per uscire"

        },
        {
            name: "scanListIp",
            msg: "Recupera gli indirizzi IP attivi"

        }
        ,
        {
            name: "scanPort",
            msg: "Scansione delle porte"

        }
        ,
        {
            name: "ssh",
            msg: "Avvia una connessione SSH"

        }
        ,
        {
            name: "localInfo",
            msg: "Informazioni di rete locali"

        }
        ,
        {
            name: "gatewayPnlCtrl",
            msg: "Apri il pannello di controllo del router"

        },
        {
            name: "getWifiList",
            msg: "Informazioni sulle reti Wifi visibili"
        }
        //END COMMANDS
        ,
        {
            name: "scanningMsg",
            msg: "Scansione degli indirizzi ip attivi..."

        },
        {
            name: "scanningWifi",
            msg: "Scansione delle reti wifi visibili..."

        },
        {
            name: "finishMsg",
            msg: "Terminato"

        },
        {
            name: "infoDevice",
            msg: "Scrivi l'indirizzo IP , lo username e la password. Esempio: 192.168.1.10_username123_password123"

        },
        {
            name: "errorMsg",
            msg: "Errore: Guarda il file di log"

        },
        {
            name: "errorOnline",
            msg: "Errore: Non sei online"

        },
        {
            name: "loadingMsg",
            msg: "Caricamento delle informazioni di rete locali..."

        },
        {
            name: "publicIp",
            msg: "Indirizzo IP pubblico: "

        },
        {
            name: "localIp",
            msg: "Indirizzo IP locale: "

        },
        {
            name: "activeInterface",
            msg: "Interfaccia attiva:"

        },
        {
            name: "nameInterface",
            msg: "Nome: "

        },
        {
            name: "ipAddress",
            msg: "Indirizzo IP: "

        },
        {
            name: "interfaceType",
            msg: "Tipo interfaccia: "

        },
        {
            name: "target",
            msg: "Su quale indirizzo IP vuoi effettuare la scansione? Ctrl+c per uscire"

        },
        {
            name: "range",
            msg: "Qual'è il range delle porte? Ctrl+c per uscire"

        },
        {
            name: "status",
            msg: "Per quale stato vuoi filtrare? Timeout, Refused, Open, Unreachable - Ctrl+c per uscire"

        },
        {
            name: "port",
            msg: "Porta: "

        },
        {
            name: "commandSsh",
            msg: "Quale comando vorresti lanciare? Scrivi 'exit' per uscire"

        },
        {
            name: "statusMsg",
            msg: "Stato: "  

        },
        {
            name: "time",
            msg: "Orario: "  

        },
        //WIFI MODE
        {
            name: "ssid",
            msg: "Nome Wifi: "  

        },
        {
            name: "mac",
            msg: "Mac Address: "  

        },
        {
            name: "channel",
            msg: "Canale: "  

        },
        {
            name: "frequency",
            msg: "Frequenza: "  

        },
        {
            name: "signaleLevel",
            msg: "Livello segnale: "  

        },
        {
            name: "quality",
            msg: "Qualità segnale: "  

        },
        {
            name: "security",
            msg: "Livello sicurezza: "  

        },
        {
            name: "securityProtocol",
            msg: "Protocollo di crittografia: "  

        },
        {
            name: "networkMode",
            msg: "Tipo di connessione: "  

        }         
    )
} else if(lang === "en")   {

    listPhrases.push(
        {
            name: "packageInstalled",
            msg: "Packages controls terminated!"

        },
        {
            name: "WelcomeMessageOnStart",
            msg: "Welcome in NetScanner! Version: " + pjson.version + "\n"

        },

        //START COMMANDS
        {
            name: "WelcomeMessage",
            msg: "What do you do? Ctrl+c to exit"

        },
        {
            name: "scanListIp",
            msg: "Get list of active ip address"

        }
        ,
        {
            name: "scanPort",
            msg: "Scan ports"

        }
        ,
        {
            name: "ssh",
            msg: "SSH connection"

        }
        ,
        {
            name: "localInfo",
            msg: "Local informations"

        }
        ,
        {
            name: "gatewayPnlCtrl",
            msg: "Open Gateway Panel Control"

        },
        {
            name: "getWifiList",
            msg: "Informations on visible wifi networks"
        } 
        //END COMMANDS
        ,
        {
            name: "scanningMsg",
            msg: "Scanning of active ip addresses..."

        },
        {
            name: "scanningWifi",
            msg: "Scanning of visible wifi networks..."

        },
        {
            name: "finishMsg",
            msg: "Finished"

        },
        {
            name: "infoDevice",
            msg: "Write Ip Address, username and password. Example: 192.168.1.10_username123_password123"

        },
        {
            name: "errorMsg",
            msg: "Error: see log file"

        },
        {
            name: "errorOnline",
            msg: "Error: You are offline"

        },
        {
            name: "loadingMsg",
            msg: "Loading local informations..."

        },
        {
            name: "publicIp",
            msg: "Public Ip: "

        },
        {
            name: "localIp",
            msg: "Local Ip: "

        },
        {
            name: "activeInterface",
            msg: "Active interface:"

        },
        {
            name: "nameInterface",
            msg: "Name: "

        },
        {
            name: "ipAddress",
            msg: "Ip address: "

        },
        {
            name: "interfaceType",
            msg: "Type: "

        },
        {
            name: "target",
            msg: "What is the IP address to scan? Ctrl+c to exit"

        },
        {
            name: "range",
            msg: "What is the range of port? Ctrl+c to exit"

        },
        {
            name: "status",
            msg: "What status would you like to find? Timeout, Refused, Open, Unreachable - Ctrl+c to exit"

        },
        {
            name: "port",
            msg: "Port: "

        },
        {
            name: "commandSsh",
            msg: "What the command that would you like to launch? Write 'exit' for exit"

        },
        {
            name: "statusMsg",
            msg: "Status: "  

        },
        {
            name: "time",
            msg: "Time: "  

        },  //WIFI MODE
        {
            name: "ssid",
            msg: "ssid: "  

        },
        {
            name: "mac",
            msg: "Mac Address: "  

        },
        {
            name: "channel",
            msg: "Channel: "  

        },
        {
            name: "frequency",
            msg: "Frequency: "  

        },
        {
            name: "signaleLevel",
            msg: "Signale level: "  

        },
        {
            name: "quality",
            msg: "Signale quality: "  

        },
        {
            name: "security",
            msg: "Security level: "  

        },
        {
            name: "securityProtocol",
            msg: "Cryptography protocol: "  

        },
        {
            name: "networkMode",
            msg: "Network mode: "  

        }           
    )
}

/**
 * Return the correct phrase 
 * @param name -> Name/cmd of phrase
 * @returns phrase stringtran
 */
function getPhrase(name)    {

    var phraseFound = null;

    listPhrases.forEach(function(phraseObj)  {

        if(phraseObj.name === name) {
            phraseFound = phraseObj;
        }
    })

    if(phraseFound != null) {
        return phraseFound.msg;
    }
}

module.exports = {
    getPhrase: getPhrase,
    listPhrases: listPhrases
}