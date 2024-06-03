"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueId = exports.sha256 = exports.getDeviceInfo = void 0;
function getDeviceInfo() {
    return [
        navigator.userAgent,
        navigator.language,
        navigator.hardwareConcurrency,
        screen.width,
        screen.height,
        screen.colorDepth,
    ].join(' ');
}
exports.getDeviceInfo = getDeviceInfo;
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}
exports.sha256 = sha256;
async function generateUniqueId() {
    const deviceInfo = getDeviceInfo();
    const deviceId = await sha256(deviceInfo);
    return deviceId;
}
exports.generateUniqueId = generateUniqueId;
