export enum Events {
  INTERNAL = 'internal',
  ERROR = 'error',
  UN_HANDLED_REJECTION = 'unhandledrejection',
  BASIC = 'basic',
  PERFORMANCE = 'performance',
  CUSTOM = 'custom',
  WHITE_SCREEN = 'whiteScreen',
}
export const containerElements = ['html', 'body', '#app', '#root'];

export const ActivityEvent = {
  MOUSE_OVER: 'mouseover',
  CLICK: 'click',
  KEY_DOWN: 'keydown',
  TOUCH_START: 'touchstart',
  TOUCH_END: 'touchend',
  SCROLL: 'scroll',
};

export const DEBOUNCE_TIMEOUT = 100;

export const CustomEvent = {
  /** 页面 load */
  LOAD: 'load',
  /** 页面卸载 */
  EXIT: 'exit',
  /** 进入页面 */
  ENTER: 'enter',
  /** 隐藏页面 */
  HIDDEN: 'hidden',
  /** 页面不活跃了 */
  INACTIVE: 'inactive',
  /** 可见但失焦 */
  PASSIVE: 'passive',
  /** 页面可见 */
  PAGE_VIEW: 'pageview',
  /** 埋点上报 */
  MONITOR_REPORT: 'monitor_report',
  /** 埋点上报-测试 */
  MONITOR_REPORT_TEST: 'monitor_report_test',
  /** 定时器触发 */
  INTERNAL: 'internal',
};
