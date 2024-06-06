export declare enum Events {
    INTERNAL = "internal",
    ERROR = "error",
    UN_HANDLED_REJECTION = "unhandledrejection",
    BASIC = "basic",
    PERFORMANCE = "performance",
    CUSTOM = "custom",
    WHITE_SCREEN = "whiteScreen"
}
export declare enum TriggerState {
    EXIT = 0,
    HIDDEN = 1,
    INACTIVE = 2
}
export declare const containerElements: string[];
export declare const ActivityEvent: {
    MOUSE_OVER: string;
    CLICK: string;
    KEY_DOWN: string;
    TOUCH_START: string;
    TOUCH_END: string;
    SCROLL: string;
};
export declare const DEBOUNCE_TIMEOUT = 100;
export declare const CustomEvent: {
    LOAD: string;
    EXIT: string;
    ENTER: string;
    HIDDEN: string;
    INACTIVE: string;
    PASSIVE: string;
    PAGE_VIEW: string;
    MONITOR_REPORT: string;
    MONITOR_REPORT_TEST: string;
    INTERNAL: string;
};
export declare enum TriggeringMethod {
    HASH = "hash",
    BOTH = "both",
    HISTORY = "history"
}
export declare enum PageUniqKey {
    href = "href",
    path = "path",
    hash = "hash"
}
export declare enum RouterEvents {
    POP_STATE = "popstate",
    PUSH_STATE = "pushState",
    REPLACE_STATE = "replaceState"
}
export declare const STATE_VISIBLE = "VISIBLE";
export declare const STATE_INVISIBLE = "INVISIBLE";
export declare const STATE_ACTIVE = "ACTVE";
export declare const STATE_INACTIVE = "INACTIVE";
export declare const STATE_EXIT = "EXIT";
export declare const DEFAULT_INTERNAL = 5000;
export declare const INACTIVE_TIMEOUT = 30000;
export declare const LIFECYCLE_EVENT = "statechange";
export declare const PAGE_STATS_CACHE_KEY = "_rr_tracer_page_stats";
export declare const ELEM_TIMEOUT = 1000;
export declare const ELEM_VISIBLE_PER = 0.75;
export declare const ELEM_HIDDEN_PER = 0.25;
