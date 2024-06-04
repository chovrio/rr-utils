import { PageUniqKey, TriggerState, TriggeringMethod } from './const';
import MonitorElement from './element';
import { Logger } from './logger';

export type WindowTimer = number;

export interface MonitorOptions {
  internal?: number;
  pageUniqKey?: PageUniqKey;
  consumer: (data: MonitorData) => void;
  inactiveTimeout?: number;
  triggerOn?: TriggerState;
  shouldMonitorElem?: boolean;
  monitorElemConfig?: MonitorElemConfig;
}

export type MonitorData =
  | {
      [key: string]: any;
    }
  | any[];

// type MonitorDataType = 'internal' | 'error' | 'basic' | 'performance' | 'custom';

export interface UrlChangeEvent {
  curUrl?: UrlObj | undefined;
  preUrl?: UrlObj;
  originEvent?: Event;
  triggeredBy?: TriggeringMethod;
}

export interface UrlObj {
  href: string;
  hash: string;
  path: string;
  host: string;
  port: string;
  pathWithHash: string;
  query: QueryObj;
}

export type QueryObj = Record<string, string>;

export interface RouterOptions {
  triggerOnInit?: boolean;
  mode?: TriggeringMethod;
  logger: Logger;
}

export const URL_CHANGE_EVENT = 'urlChange';

export interface ObserverElemOptions {
  visiblePercent: number;
  hiddenPercent: number;
}

export type ElementInfo = {
  key: string;
  name: string;
  node: Element;
  observer?: MonitorElement;
  [key: string]: any;
};

export type MonitorElementOptions = {
  key: string;
  name: string;
  node: Element;
  config: MonitorElemConfig;
  [key: string]: any;
};

export type MonitorElemConfig = {
  visiblePercent?: number;
  hiddenPercent?: number;
  duration?: number;
  bindVisibilityWithActivity?: boolean;
};

export type PageOptions = {
  path: string;
  url: UrlObj;
  prevUrl?: UrlObj;
  shouldMonitorElem?: boolean;
  monitorElemConfig?: MonitorElemConfig;
};
