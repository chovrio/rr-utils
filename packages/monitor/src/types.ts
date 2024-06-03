export interface MonitorOptions {
  internal?: number;
}

export interface MonitorData {
  type: MonitorDataType;
  [key: string]: string;
}

type MonitorDataType = 'internal' | 'error' | 'basic' | 'performance' | 'custom';
