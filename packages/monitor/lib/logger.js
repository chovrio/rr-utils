"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    info(...res) {
        console.info('[info]', ...res);
    }
    warn(...res) {
        console.warn('[warn]', ...res);
    }
    error(...res) {
        console.error('[error]', ...res);
    }
    debug(...res) {
        if (process.env.NODE_ENV === 'development') {
            console.log('[debug]', ...res);
        }
    }
}
exports.Logger = Logger;
