export const add = (a: number, b: number) => a + b;

/**
 * Monitor
 * 功能：
 * 1.基础埋点事件 click hover pv
 * 2.页面 view 时长
 * 3.模块活跃时长 active view
 */
export class Monitor {
  private static instance: Monitor;

  private constructor() {
    // 私有化构造函数，防止外部直接创建实例
  }

  public static getInstance(): Monitor {
    if (!Monitor.instance) {
      Monitor.instance = new Monitor();
    }
    return Monitor.instance;
  }
}
