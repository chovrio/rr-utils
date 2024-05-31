import { RouterEvents, URL_CHANGE_EVENT } from './const';
import EventEmitter from './event-emitter';
import { UrlChangeEvent } from './type';

export class Router {
  private curUrl!: string;
  private ee!: EventEmitter;
  private listener?: (event: UrlChangeEvent) => void;
  private readonly listeners!: Record<string, ((event: Event) => void) | undefined>;
  private originHitoryApis!: Record<string, (data: any, title: string, url?: string | null) => void>;

  constructor() {
    if (!window) {
      console.error('window is not defined');
      return;
    }
    this.ee = new EventEmitter();
    this.curUrl = window.location.href;
  }

  public onUrlChange(cb: (event: UrlChangeEvent) => void) {
    if (!this.ee) {
      return;
    }

    if (this.listener) {
      this.removeAllListeners();
    }

    this.hijackHistoryApis();
    this.registerListeners();

    this.listener = cb;
    this.ee?.on(URL_CHANGE_EVENT, this.listener);
  }

  private hijackHistoryApis() {
    this.originHitoryApis = {
      pushState: window.history.pushState,
      replaceState: window.history.replaceState,
    };

    window.history.pushState = this.createHistoryEvent('pushState');
    window.history.replaceState = this.createHistoryEvent('replaceState');
  }

  private createHistoryEvent<T extends keyof History>(type: T) {
    const origin = this.originHitoryApis[type];
    return function (this: any, ...rest: [any, string, string | null]) {
      const res = origin.apply(this, rest);
      const e = new Event(type);
      window.dispatchEvent(e);
      return res;
    };
  }

  private registerListeners() {
    Object.values(RouterEvents).forEach(event => {
      const listener = (e: Event) => {
        const curUrl = new URL(window.location.href);
        const prevUrl = new URL(this.curUrl);
        this.curUrl = window.location.href;
        const isHashChanged: boolean = curUrl.hash !== prevUrl.hash;
        const isPathChanged: boolean = curUrl.pathname !== prevUrl.pathname;
        const newEvent = {
          curUrl,
          prevUrl,
          origEvent: e,
          triggeredBy:
            isHashChanged && isPathChanged ? 'both' : isHashChanged ? 'hash' : isPathChanged ? 'path' : 'both',
        };
        newEvent && this.ee?.emit(URL_CHANGE_EVENT, newEvent);
      };
      this.listeners[event] = listener;
      window.addEventListener(event, listener);
    });
  }

  private removeAllListeners() {
    Object.values(RouterEvents).forEach(event => {
      const listener = this.listeners[event];
      if (listener) {
        window.removeEventListener(event, listener);
      }
      this.listeners[event] = undefined;
    });
    window.history.pushState = this.originHitoryApis.pushState;
    window.history.replaceState = this.originHitoryApis.replaceState;
    this.ee?.removeAllListeners();
    this.listener = undefined;
  }
}
