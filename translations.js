var x = process.env.LANG.substring(0, process.env.LANG.indexOf("_")); // get local language

var listPhrases = [];

if(x === "it")  {

    listPhrases.push(
        {
            name: "packageInstalled",
            msg: "Controllo pacchetti terminato!"

        },
        {
            name: "WelcomeMessageWithLogo",
            msg: "Benvenuto in NetScanner! \nversione: "

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

        }
        //END COMMANDS
        ,
        {
            name: "scanningMsg",
            msg: "Scansione..."

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
            name: "loadingMsg",
            msg: "Caricamento..."

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

        }   
           
    )
} else if(x === "en")   {

    listPhrases.push(
        {
            name: "packageInstalled",
            msg: "Packages controls terminated!"

        },
        {
            name: "WelcomeMessageWithLogo",
            msg: "Welcome in NetScanner! \nversion: "

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

        }
        //END COMMANDS
        ,
        {
            name: "scanningMsg",
            msg: "Scanning..."

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
            name: "loadingMsg",
            msg: "Loading..."

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