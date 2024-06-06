"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLocalStorageSupported = exports.getPageUniqKey = exports.isVisibleByStyling = exports.isDisplayed = exports.styleProperty = exports.computedStyle = exports.safeJsonParse = exports.generateUUID = exports.isElement = exports.parseQueryObject = exports.isContainer = exports.getSelector = exports.onLoad = exports.generateUniqueId = exports.sha256 = exports.getDeviceInfo = exports.debounce = void 0;
const const_1 = require("./const");
function debounce(func, waitMilliseconds = 50, options = {
    isImmediate: false
}) {
    let timeoutId;
    const debouncedFunction = function (...args) {
        const context = this;
        const doLater = function () {
            timeoutId = undefined;
            if (!options.isImmediate) {
                func.apply(context, args);
            }
        };
        const shouldCallNow = options.isImmediate && timeoutId === undefined;
        if (timeoutId !== undefined) {
            window.clearTimeout(timeoutId);
        }
        timeoutId = window.setTimeout(doLater, waitMilliseconds);
        if (shouldCallNow) {
            func.apply(context, args);
        }
    };
    debouncedFunction.cancel = function () {
        if (timeoutId !== undefined) {
            window.clearTimeout(timeoutId);
        }
    };
    return debouncedFunction;
}
exports.debounce = debounce;
function getDeviceInfo() {
    return [
        navigator.userAgent,
        navigator.language,
        navigator.hardwareConcurrency,
        screen.width,
        screen.height,
        screen.colorDepth
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
function onLoad(callback) {
    if (document.readyState === 'complete') {
        callback();
    }
    else {
        window.addEventListener('load', callback);
    }
}
exports.onLoad = onLoad;
function getSelector(element) {
    if (element.id) {
        return `#${element.id}`;
    }
    else if (element.className) {
        return `.${element.className
            .split(' ')
            .filter(item => !!item)
            .join('.')}`;
    }
    else {
        return element.tagName.toLowerCase();
    }
}
exports.getSelector = getSelector;
function isContainer(element) {
    const selector = getSelector(element);
    if (const_1.containerElements.indexOf(selector) > -1) {
        return true;
    }
    return false;
}
exports.isContainer = isContainer;
function parseQueryObject(queryStr) {
    const result = {};
    queryStr &&
        queryStr
            .substring(1)
            .split('&')
            .forEach(pairStr => {
            const pair = pairStr.split('=');
            pair[0] && (result[decodeURIComponent(pair[0])] = pair[1] ? decodeURIComponent(pair[1]) : '');
        });
    return result;
}
exports.parseQueryObject = parseQueryObject;
function isElement(value) {
    return (value && value.nodeType === Node.ELEMENT_NODE) || false;
}
exports.isElement = isElement;
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
exports.generateUUID = generateUUID;
function safeJsonParse(str) {
    try {
        return JSON.parse(str || '');
    }
    catch (e) {
        return {};
    }
}
exports.safeJsonParse = safeJsonParse;
function computedStyle(element) {
    return window.getComputedStyle(element, null);
}
exports.computedStyle = computedStyle;
function styleProperty(style, property) {
    return style.getPropertyValue(property);
}
exports.styleProperty = styleProperty;
function isDisplayed(element, style) {
    if (!style) {
        style = computedStyle(element);
    }
    const display = styleProperty(style, 'display');
    if (display === 'none') {
        return false;
    }
    const parent = element.parentNode;
    return parent && isElement(parent) ? isDisplayed(parent) : true;
}
exports.isDisplayed = isDisplayed;
function isVisibleByStyling(element) {
    if (element === window.document)
        return true;
    if (!element || !element.parentNode)
        return false;
    const style = computedStyle(element);
    const visibility = styleProperty(style, 'visibility');
    if (visibility === 'hidden' || visibility === 'collapse')
        return false;
    const opacity = styleProperty(style, 'opacity');
    if (opacity === '0')
        return false;
    return isDisplayed(element, style);
}
exports.isVisibleByStyling = isVisibleByStyling;
function getPageUniqKey(key) {
    switch (key) {
        case const_1.PageUniqKey.href: {
            return const_1.PageUniqKey.href;
        }
        case const_1.PageUniqKey.path: {
            return const_1.PageUniqKey.path;
        }
        case const_1.PageUniqKey.hash: {
            return 'pathWithHash';
        }
        default: {
            return const_1.PageUniqKey.href;
        }
    }
}
exports.getPageUniqKey = getPageUniqKey;
function isLocalStorageSupported() {
    let localStorageSupported = null;
    if (localStorageSupported !== null) {
        return localStorageSupported;
    }
    try {
        localStorage.setItem('check', 'check');
        localStorage.getItem('check');
        localStorage.removeItem('check');
        localStorageSupported = true;
    }
    catch (error) {
        localStorageSupported = false;
        console.error('[Monitor] localStorage not supported');
    }
    return localStorageSupported;
}
exports.isLocalStorageSupported = isLocalStorageSupported;
