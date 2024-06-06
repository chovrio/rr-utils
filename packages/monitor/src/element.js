"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const const_1 = require("./const");
const observer_1 = require("./observer");
const utils_1 = require("./utils");
const DEFAULT_OPTIONS = {
    visiblePercent: const_1.ELEM_VISIBLE_PER,
    hiddenPercent: const_1.ELEM_HIDDEN_PER,
    duration: const_1.ELEM_TIMEOUT
};
class MonitorElement {
    key;
    name;
    node;
    config;
    observer;
    isActive;
    isVisible;
    enterTime;
    leaveTime;
    lastVisibleTime;
    lastInVisibleTime;
    visibleDuration;
    enterActiveTime;
    leaveActiveTime;
    lastActiveTime;
    lastInActiveTime;
    activeDuration;
    ratio;
    activeTimer;
    visibleTimer;
    constructor(options) {
        const { key, node, config, name } = options || {};
        this.key = key;
        this.node = node;
        this.name = name;
        this.config = {
            visiblePercent: config.visiblePercent || DEFAULT_OPTIONS.visiblePercent,
            hiddenPercent: config?.hiddenPercent || DEFAULT_OPTIONS.hiddenPercent,
            duration: config?.duration || DEFAULT_OPTIONS.duration,
            bindVisibilityWithActivity: config?.bindVisibilityWithActivity
        };
        this.isActive = false;
        this.isVisible = false;
        this.activeDuration = 0;
        this.visibleDuration = 0;
        this.ratio = 0;
        this.start();
    }
    start() {
        const visiblePercent = this.config.visiblePercent;
        const hiddenPercent = this.config.hiddenPercent;
        this.observer = (0, observer_1.ObserverElem)(this.node, {
            visiblePercent,
            hiddenPercent
        }, ratio => {
            this.ratio = ratio;
            this.checkStatus(true);
        });
    }
    exit() {
        this.observer?.disconnect();
        this.node.removeAttribute('data-monitor-id');
        this.mark(const_1.STATE_EXIT);
        return this.report;
    }
    mark(state, time = Date.now()) {
        switch (state) {
            case const_1.STATE_VISIBLE: {
                if (this.isVisible)
                    return;
                this.isVisible = true;
                this.lastVisibleTime = time;
                if (!this.enterTime) {
                    this.enterTime = time;
                }
                break;
            }
            case const_1.STATE_INVISIBLE: {
                if (!this.isVisible)
                    return;
                this.isVisible = false;
                this.lastInVisibleTime = time;
                this.visibleDuration += this.lastInVisibleTime - this.lastVisibleTime;
                this.leaveTime = time;
                break;
            }
            case const_1.STATE_ACTIVE: {
                if (this.isActive)
                    return;
                this.isActive = true;
                this.lastActiveTime = time;
                if (!this.enterActiveTime) {
                    this.enterActiveTime = time;
                }
                break;
            }
            case const_1.STATE_INACTIVE: {
                if (!this.isActive)
                    return;
                this.isActive = false;
                this.lastInActiveTime = time;
                this.activeDuration += this.lastInActiveTime - this.lastActiveTime;
                this.leaveActiveTime = time;
                break;
            }
            case const_1.STATE_EXIT: {
                this.leaveTime = time;
                this.leaveActiveTime = time;
                if (this.isVisible) {
                    this.isVisible = false;
                    this.visibleDuration += time - this.lastVisibleTime;
                }
                if (this.isActive) {
                    this.isActive = false;
                    this.activeDuration += time - this.lastActiveTime;
                }
            }
        }
    }
    checkStatus(lazy) {
        const isVisible = this.checkVisibility();
        if (isVisible) {
            this.onVisible(lazy);
        }
        else {
            this.onInvisible(lazy);
        }
    }
    checkVisibility() {
        const { visiblePercent, hiddenPercent } = this.config;
        if (!(0, utils_1.isVisibleByStyling)(this.node)) {
            return false;
        }
        if (this.ratio <= hiddenPercent) {
            return false;
        }
        else if (this.ratio >= visiblePercent) {
            return true;
        }
    }
    setVisibleState(visible, lazy) {
        if (visible && this.checkVisibility()) {
            return this.onVisible(lazy);
        }
        else {
            return this.onInvisible(lazy);
        }
    }
    onVisible(lazy) {
        this.clearLazyVisibleTimer();
        if (this.isVisible) {
            return this.report;
        }
        if (lazy) {
            this.startVisibleTimer(const_1.STATE_VISIBLE, this.config.duration);
        }
        else {
            this.mark(const_1.STATE_INVISIBLE);
        }
        return this.report;
    }
    onInvisible(lazy) {
        this.clearLazyVisibleTimer();
        console.log(this.name, this.isVisible);
        if (!this.isVisible) {
            return this.report;
        }
        if (lazy) {
            this.startVisibleTimer(const_1.STATE_INVISIBLE, this.config.duration);
        }
        else {
            this.mark(const_1.STATE_INVISIBLE);
        }
        return this.report;
    }
    onActive() {
        this.clearLazyActiveTimer();
        if (this.isActive) {
            return this.report;
        }
        this.startActiveTimer(const_1.STATE_ACTIVE, this.config.duration);
    }
    onInActive() {
        this.clearLazyActiveTimer();
        if (!this.isActive) {
            return this.report;
        }
        this.startActiveTimer(const_1.STATE_INACTIVE, this.config.duration);
    }
    startVisibleTimer(state, time) {
        this.clearLazyVisibleTimer();
        const now = Date.now();
        this.visibleTimer = window.setTimeout(() => {
            this.mark(state, now);
        }, time);
    }
    startActiveTimer(state, time) {
        this.clearLazyActiveTimer();
        const now = Date.now();
        this.activeTimer = window.setTimeout(() => {
            this.mark(state, now);
        }, time);
    }
    clearLazyVisibleTimer() {
        window.clearTimeout(this.visibleTimer);
    }
    clearLazyActiveTimer() {
        window.clearTimeout(this.activeTimer);
    }
    get report() {
        return {
            enterTime: this.enterTime,
            leaveTime: this.leaveTime,
            visibleDuration: this.visibleDuration,
            enterActiveTime: this.enterActiveTime,
            leaveActiveTime: this.leaveActiveTime,
            activeDuration: this.activeDuration
        };
    }
}
exports.default = MonitorElement;
