export enum Events {
  INTERNAL = "internal",
  ERROR = "error",
  UN_HANDLED_REJECTION = "unhandledrejection",
  BASIC = "basic",
  PERFORMANCE = "performance",
  CUSTOM = "custom",
  WHITE_SCREEN = "whiteScreen",
}

export enum TriggerState {
  EXIT,
  HIDDEN,
  INACTIVE,
}

export const containerElements = ["html", "body", "#app", "#root"];

export const ActivityEvent = {
  MOUSE_OVER: "mouseover",
  CLICK: "click",
  KEY_DOWN: "keydown",
  TOUCH_START: "touchstart",
  TOUCH_END: "touchend",
  SCROLL: "scroll",
};

export const DEBOUNCE_TIMEOUT = 100;

export const CustomEvent = {
  /** 页面 load */
  LOAD: "load",
  /** 页面卸载 */
  EXIT: "exit",
  /** 进入页面 */
  ENTER: "enter",
  /** 隐藏页面 */
  HIDDEN: "hidden",
  /** 页面不活跃了 */
  INACTIVE: "inactive",
  /** 可见但失焦 */
  PASSIVE: "passive",
  /** 页面可见 */
  PAGE_VIEW: "pageview",
  /** 埋点上报 */
  MONITOR_REPORT: "monitor_report",
  /** 埋点上报-测试 */
  MONITOR_REPORT_TEST: "monitor_report_test",
  /** 定时器触发 */
  INTERNAL: "internal",
};

/**
 * Router 触发模式
 */
export enum TriggeringMethod {
  HASH = "hash",
  BOTH = "both",
  HISTORY = "history",
}

export enum PageUniqKey {
  href = "href",
  path = "path",
  hash = "hash",
}

/**
 * Router 事件
 */
export enum RouterEvents {
  POP_STATE = "popstate",
  PUSH_STATE = "pushState",
  REPLACE_STATE = "replaceState",
}

export const STATE_VISIBLE = "VISIBLE";
export const STATE_INVISIBLE = "INVISIBLE";
export const STATE_ACTIVE = "ACTVE";
export const STATE_INACTIVE = "INACTIVE";
export const STATE_EXIT = "EXIT";

export const DEFAULT_INTERNAL = 5000;
export const INACTIVE_TIMEOUT = 30000;
export const LIFECYCLE_EVENT = "statechange";
export const PAGE_STATS_CACHE_KEY = "_rr_tracer_page_stats";

export const ELEM_TIMEOUT = 1000;
export const ELEM_VISIBLE_PER = 0.75;
export const ELEM_HIDDEN_PER = 0.25;
