import { Events } from './const';
import EventEmitter, { EmitterFunction } from './event-emitter';
import { Logger } from './logger';
import { MonitorData, MonitorOptions } from './types';
import { generateUniqueId } from './utils';

const defaultMonitorOptions: MonitorOptions = {
  internal: 5000,
};

export class Monitor {
  private ee: EventEmitter;
  private logger: Logger;
  private options: MonitorOptions;
  private onLoadListener!: EmitterFunction;
  private listeners: Record<string, EmitterFunction>;
  constructor(options: MonitorOptions) {
    this.ee = new EventEmitter();
    this.logger = new Logger();
    this.listeners = {};
    this.options = {
      internal: options.internal || defaultMonitorOptions.internal,
    };

    this.initLoadListener();
  }

  /**
   * 采用单例模式
   * @param options Monitor 配置
   * @returns
   */
  static init(options: MonitorOptions) {
    const instance = new Monitor(options);
    return instance;
  }

  /**
   * 添加事件监听
   * @param event 事件名
   * @param listener 回调函数
   */
  addListener(event: string, listener: EmitterFunction) {
    this.ee.on(event, listener);
    this.listeners[event] = listener;
  }

  /**
   * 移除事件监听
   * @param event 事件名
   */
  removeListener(event: string) {
    this.ee.off(event, this.listeners[event]);
    delete this.listeners[event];
  }

  /**
   * 触发事件回调
   * @param event 事件名
   * @param data 参数
   */
  dispatchEvent(event: string, data: MonitorData) {
    this.ee.emit(event, data);
    this.logger.debug('dispatchEvent', event, data);
  }

  /**
   * 添加对页面初始化 load 事件的监听
   * @private
   */
  private initLoadListener() {
    const loadListener = () => {
      this.initPerformance();
    };

    window.addEventListener('load', loadListener);

    this.onLoadListener = loadListener;
  }

  private initBasic() {
    const UniqueId = generateUniqueId();
  }

  /**
   * 收集页面的一些基本信息
   * @private
   */
  private initPerformance() {
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntriesByType('navigation');
      const navigationEntry = entries[0];
      if (navigationEntry instanceof PerformanceNavigationTiming) {
        const t = navigationEntry;
        let r = 0;
        r = t.startTime;
        const n = [
          {
            key: 'Redirect',
            desc: '\u7f51\u9875\u91cd\u5b9a\u5411\u7684\u8017\u65f6',
            value: t.redirectEnd - t.redirectStart,
          },
          {
            key: 'AppCache',
            desc: '\u68c0\u67e5\u672c\u5730\u7f13\u5b58\u7684\u8017\u65f6',
            value: t.domainLookupStart - t.fetchStart,
          },
          {
            key: 'DNS',
            desc: 'DNS\u67e5\u8be2\u7684\u8017\u65f6',
            value: t.domainLookupEnd - t.domainLookupStart,
          },
          {
            key: 'TCP',
            desc: 'TCP\u8fde\u63a5\u7684\u8017\u65f6',
            value: t.connectEnd - t.connectStart,
          },
          {
            key: 'Waiting(TTFB)',
            desc: '\u4ece\u5ba2\u6237\u7aef\u53d1\u8d77\u8bf7\u6c42\u5230\u63a5\u6536\u5230\u54cd\u5e94\u7684\u65f6\u95f4 / Time To First Byte',
            value: t.responseStart - t.requestStart,
          },
          {
            key: 'Content Download',
            desc: '\u4e0b\u8f7d\u670d\u52a1\u7aef\u8fd4\u56de\u6570\u636e\u7684\u65f6\u95f4',
            value: t.responseEnd - t.responseStart,
          },
          {
            key: 'HTTP Total Time',
            desc: 'http\u8bf7\u6c42\u603b\u8017\u65f6',
            value: t.responseEnd - t.requestStart,
          },
          {
            key: 'DOMContentLoaded',
            desc: 'dom\u52a0\u8f7d\u5b8c\u6210\u7684\u65f6\u95f4',
            value: t.domContentLoadedEventEnd - r,
          },
          {
            key: 'Loaded',
            desc: '\u9875\u9762load\u7684\u603b\u8017\u65f6',
            value: t.loadEventEnd - r,
          },
        ];
        // 只对25%的用户进行上报
        if (Math.random() > 0.75) {
          this.ee.emit(Events.PERFORMANCE, n);
        }
        console && console.log && console.log(n);
      }
    });
    observer.observe({ entryTypes: ['navigation'] });
  }
}
