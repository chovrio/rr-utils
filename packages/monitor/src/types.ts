export interface MonitorOptions {
  internal?: number;
  consumer: (data: MonitorData) => void;
  inactiveTimeout?: number;
}

export type MonitorData =
  | {
      [key: string]: any;
    }
  | any[];

// type MonitorDataType = 'internal' | 'error' | 'basic' | 'performance' | 'custom';

export type Timeout = ReturnType<typeof setTimeout>;
export type Immediate = ReturnType<typeof setImmediate>;
