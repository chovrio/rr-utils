"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventEmitter {
    events;
    constructor() {
        this.events = {};
    }
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }
    emit(event, ...args) {
        if (this.events[event]) {
            return this.events[event].map(listener => listener(...args));
        }
        return [];
    }
    off(event, listener) {
        if (this.events[event]) {
            const index = this.events[event].indexOf(listener);
            if (index !== -1) {
                this.events[event].splice(index, 1);
            }
        }
    }
    once(event, listener) {
        const onceListener = (...args) => {
            this.off(event, onceListener);
            return listener(...args);
        };
        this.on(event, onceListener);
    }
    removeListener(event, listener) {
        const listeners = this.events[event];
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }
    removeAllListeners(event) {
        if (event) {
            delete this.events[event];
        }
        else {
            this.events = {};
        }
    }
    listenerCount(event) {
        return this.events[event] ? this.events[event].length : 0;
    }
    eventNames() {
        return Object.keys(this.events);
    }
    rawListeners(event) {
        return this.events[event] || [];
    }
    listeners(event) {
        return this.rawListeners(event).slice();
    }
    prependListener(event, listener) {
        this.events[event].unshift(listener);
    }
    prependOnceListener(event, listener) {
        const onceListener = (...args) => {
            listener(...args);
            this.off(event, onceListener);
        };
        this.prependListener(event, onceListener);
    }
}
exports.default = EventEmitter;
