"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ELEM_HIDDEN_PER = exports.ELEM_VISIBLE_PER = exports.ELEM_TIMEOUT = exports.PAGE_STATS_CACHE_KEY = exports.LIFECYCLE_EVENT = exports.INACTIVE_TIMEOUT = exports.DEFAULT_INTERNAL = exports.STATE_EXIT = exports.STATE_INACTIVE = exports.STATE_ACTIVE = exports.STATE_INVISIBLE = exports.STATE_VISIBLE = exports.RouterEvents = exports.PageUniqKey = exports.TriggeringMethod = exports.CustomEvent = exports.DEBOUNCE_TIMEOUT = exports.ActivityEvent = exports.containerElements = exports.TriggerState = exports.Events = void 0;
var Events;
(function (Events) {
    Events["INTERNAL"] = "internal";
    Events["ERROR"] = "error";
    Events["UN_HANDLED_REJECTION"] = "unhandledrejection";
    Events["BASIC"] = "basic";
    Events["PERFORMANCE"] = "performance";
    Events["CUSTOM"] = "custom";
    Events["WHITE_SCREEN"] = "whiteScreen";
})(Events || (exports.Events = Events = {}));
var TriggerState;
(function (TriggerState) {
    TriggerState[TriggerState["EXIT"] = 0] = "EXIT";
    TriggerState[TriggerState["HIDDEN"] = 1] = "HIDDEN";
    TriggerState[TriggerState["INACTIVE"] = 2] = "INACTIVE";
})(TriggerState || (exports.TriggerState = TriggerState = {}));
exports.containerElements = ['html', 'body', '#app', '#root'];
exports.ActivityEvent = {
    MOUSE_OVER: 'mouseover',
    CLICK: 'click',
    KEY_DOWN: 'keydown',
    TOUCH_START: 'touchstart',
    TOUCH_END: 'touchend',
    SCROLL: 'scroll'
};
exports.DEBOUNCE_TIMEOUT = 100;
exports.CustomEvent = {
    LOAD: 'load',
    EXIT: 'exit',
    ENTER: 'enter',
    HIDDEN: 'hidden',
    INACTIVE: 'inactive',
    PASSIVE: 'passive',
    PAGE_VIEW: 'pageview',
    MONITOR_REPORT: 'monitor_report',
    MONITOR_REPORT_TEST: 'monitor_report_test',
    INTERNAL: 'internal'
};
var TriggeringMethod;
(function (TriggeringMethod) {
    TriggeringMethod["HASH"] = "hash";
    TriggeringMethod["BOTH"] = "both";
    TriggeringMethod["HISTORY"] = "history";
})(TriggeringMethod || (exports.TriggeringMethod = TriggeringMethod = {}));
var PageUniqKey;
(function (PageUniqKey) {
    PageUniqKey["href"] = "href";
    PageUniqKey["path"] = "path";
    PageUniqKey["hash"] = "hash";
})(PageUniqKey || (exports.PageUniqKey = PageUniqKey = {}));
var RouterEvents;
(function (RouterEvents) {
    RouterEvents["POP_STATE"] = "popstate";
    RouterEvents["PUSH_STATE"] = "pushState";
    RouterEvents["REPLACE_STATE"] = "replaceState";
})(RouterEvents || (exports.RouterEvents = RouterEvents = {}));
exports.STATE_VISIBLE = 'VISIBLE';
exports.STATE_INVISIBLE = 'INVISIBLE';
exports.STATE_ACTIVE = 'ACTVE';
exports.STATE_INACTIVE = 'INACTIVE';
exports.STATE_EXIT = 'EXIT';
exports.DEFAULT_INTERNAL = 5000;
exports.INACTIVE_TIMEOUT = 30000;
exports.LIFECYCLE_EVENT = 'statechange';
exports.PAGE_STATS_CACHE_KEY = '_rr_tracer_page_stats';
exports.ELEM_TIMEOUT = 1000;
exports.ELEM_VISIBLE_PER = 0.75;
exports.ELEM_HIDDEN_PER = 0.25;
