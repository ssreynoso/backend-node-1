export const getFlatIP = function(ip: string) {
    return ip.replace(/\.|:/gi, '')
}