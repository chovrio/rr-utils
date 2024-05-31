export type EmitterFunction = (...args: any[]) => void;

class EventEmitter {
  private events: Record<string, EmitterFunction[]>;

  constructor() {
    this.events = {};
  }

  // 监听事件
  on(event: string, listener: EmitterFunction): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  // 触发事件
  emit(event: string, ...args: any[]): any[] {
    if (this.events[event]) {
      return this.events[event].map(listener => listener(...args));
    }
    return [];
  }

  // 移除事件监听
  off(event: string, listener: EmitterFunction): void {
    if (this.events[event]) {
      const index = this.events[event].indexOf(listener);
      if (index !== -1) {
        this.events[event].splice(index, 1);
      }
    }
  }

  // 只监听一次的事件
  once(event: string, listener: EmitterFunction): void {
    const onceListener = (...args: any[]) => {
      this.off(event, onceListener);
      return listener(...args);
    };
    this.on(event, onceListener);
  }

  // 移除指定事件监听器
  removeListener(event: string, listener: EmitterFunction): void {
    const listeners = this.events[event];
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // 移除所有事件监听
  removeAllListeners(event?: string): void {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }

  // 获取事件监听器数量
  listenerCount(event: string): number {
    return this.events[event] ? this.events[event].length : 0;
  }

  // 获取所有事件名称
  eventNames(): string[] {
    return Object.keys(this.events);
  }

  // 获取所有事件监听器
  rawListeners(event: string): EmitterFunction[] {
    return this.events[event] || [];
  }

  // 获取所有事件监听器浅拷贝
  listeners(event: string): EmitterFunction[] {
    return this.rawListeners(event).slice();
  }

  // 在事件监听器数组开头添加事件监听器
  prependListener(event: string, listener: EmitterFunction): void {
    this.events[event].unshift(listener);
  }

  // 在事件监听器数组开头添加只监听一次的事件监听器
  prependOnceListener(event: string, listener: EmitterFunction): void {
    const onceListener = (...args: any[]) => {
      listener(...args);
      this.off(event, onceListener);
    };
    this.prependListener(event, onceListener);
  }
}

export default EventEmitter;
