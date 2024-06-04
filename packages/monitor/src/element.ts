import {
  ELEM_HIDDEN_PER,
  ELEM_TIMEOUT,
  ELEM_VISIBLE_PER,
  STATE_ACTIVE,
  STATE_EXIT,
  STATE_INACTIVE,
  STATE_INVISIBLE,
  STATE_VISIBLE,
} from './const';
import { ObserverElem } from './observer';
import { MonitorElemConfig, MonitorElementOptions, WindowTimer } from './types';
import { isVisibleByStyling } from './utils';

const DEFAULT_OPTIONS: MonitorElemConfig = {
  visiblePercent: ELEM_VISIBLE_PER,
  hiddenPercent: ELEM_HIDDEN_PER,
  duration: ELEM_TIMEOUT,
};

export type MARK_STATE =
  | typeof STATE_VISIBLE
  | typeof STATE_INVISIBLE
  | typeof STATE_ACTIVE
  | typeof STATE_INACTIVE
  | typeof STATE_EXIT;

class MonitorElement {
  private readonly key: string;
  private readonly node: Element;
  private readonly config: MonitorElemConfig;
  private observer?: IntersectionObserver;
  private isVisible: boolean;
  private enterTime!: number;
  private leaveTime!: number;
  private lastVisibleTime!: number;
  private lastInVisibleTime!: number;
  private visibleDuration: number;
  private ratio: number;
  private visibleTimer?: WindowTimer;
  constructor(options: MonitorElementOptions) {
    const { key, node, config } = options || {};
    this.key = key;
    this.node = node;
    this.config = {
      visiblePercent: config.visiblePercent || DEFAULT_OPTIONS.visiblePercent,
      hiddenPercent: config?.hiddenPercent || DEFAULT_OPTIONS.hiddenPercent,
      duration: config?.duration || DEFAULT_OPTIONS.duration,
      bindVisibilityWithActivity: config?.bindVisibilityWithActivity,
    };
    this.isVisible = false;
    this.visibleDuration = 0;
    this.ratio = 0;
    this.start();
  }

  public start() {
    const visiblePercent = this.config.visiblePercent!;
    const hiddenPercent = this.config.hiddenPercent!;

    this.observer = ObserverElem(
      this.node,
      {
        visiblePercent,
        hiddenPercent,
      },
      ratio => {
        this.ratio = ratio;
        this.checkStatus(true);
      },
    );
  }

  public exit() {
    this.observer?.disconnect();
    this.node.setAttribute('data-monitor-id', '');
    this.mark(STATE_EXIT);
    return this.report;
  }

  public mark(state: MARK_STATE, time = Date.now()) {
    switch (state) {
      // 可见
      case STATE_VISIBLE: {
        if (this.isVisible) return;
        this.isVisible = true;
        this.lastVisibleTime = time;
        if (!this.enterTime) {
          this.enterTime = time;
        }
        break;
      }
      // 不可见
      case STATE_INVISIBLE: {
        if (!this.isVisible) return;
        this.isVisible = false;
        this.lastInVisibleTime = time;
        this.visibleDuration += this.lastInVisibleTime - this.lastVisibleTime;
        this.leaveTime = time;
        break;
      }
      case STATE_EXIT: {
        this.leaveTime = time;
        if (this.isVisible) {
          this.isVisible = false;
          this.visibleDuration += time - this.lastVisibleTime;
        }
      }
    }
  }

  public checkStatus(lazy: boolean) {
    const isVisible = this.checkVisibility();
    if (isVisible) {
      this.onVisible(lazy);
    } else {
      this.onInvisible(lazy);
    }
  }

  public checkVisibility() {
    const { visiblePercent, hiddenPercent } = this.config;
    if (!isVisibleByStyling(this.node)) {
      return false;
    }
    if (this.ratio <= hiddenPercent!) {
      return false;
    } else if (this.ratio >= visiblePercent!) {
      return true;
    }
  }

  public setVisibleState(visible: boolean, lazy: boolean) {
    if (visible && this.checkVisibility()) {
      return this.onVisible(lazy);
    } else {
      return this.onInvisible(lazy);
    }
  }

  public onVisible(lazy: boolean) {
    this.clearLazyTimer();
    if (this.isVisible) {
      return this.report;
    }
    if (lazy) {
      this.startVisibleTimer(STATE_VISIBLE, this.config.duration!);
    } else {
      this.mark(STATE_INVISIBLE);
    }
    return this.report;
  }

  public onInvisible(lazy: boolean) {
    this.clearLazyTimer();
    if (!this.isVisible) {
      return this.report;
    }
    if (lazy) {
      this.startVisibleTimer(STATE_INVISIBLE, this.config.duration!);
    } else {
      this.mark(STATE_INVISIBLE);
    }
    return this.report;
  }

  private startVisibleTimer(state: MARK_STATE, time: number) {
    this.clearLazyTimer();
    const now = Date.now();
    this.visibleTimer = window.setTimeout(() => {
      this.mark(state, now);
    }, time);
  }

  private clearLazyTimer() {
    window.clearTimeout(this.visibleTimer);
  }

  get report() {
    return {
      enterTime: this.enterTime,
      leaveTime: this.leaveTime,
      visibleDuration: this.visibleDuration,
    };
  }
}

export default MonitorElement;
