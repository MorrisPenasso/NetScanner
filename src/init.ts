interface IPingStatus {
    host: string,
    alive: boolean
}

interface INetworkInformations {
    name: string,
    ip_address: string,
    mac_address: string,
    gateway_ip: string,
    netmask: string,
    type: string
}

interface IScannerOptions {
    target: string,
    port: string,
    status: string, // Timeout, Refused, Open, Unreachable
    banner: boolean
}

interface IScannerResult {
    ip: string,
    port: string,
    banner: string,
    status: string
}

interface ISignaleWifi {
    ssid: string,
    mac: string,
    channel: string,
    frequency: string,
    signal_level: string,
    quality: string,
    security: string,
    security_flags: string,
    mode: string,
}

interface ITranslationPhrase {
    name: string,
    msg: string
}