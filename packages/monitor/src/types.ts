import { Events, PageUniqKey, TriggerState, TriggeringMethod } from './const';
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
	| MonitorDataInternal
	| MonitorDataBasic
	| MonitorDataCustom
	| MonitorDataError
	| MonitorDataPerformance
	| MonitorDataUnHandledReject
	| MonitorDataWhiteScreen
	| PVEvent;

interface MonitorDataAll {
	type: MonitorDataType;
	data: any;
	[key: string]: any;
}
export type PVEvent = {
	type: string;
	currUrl: UrlObj;
	prevUrl?: UrlObj;
	path: string;
	title: string;
	query: QueryObj;
	enterTime: number;
	leaveTime?: number;
	activeDuration?: number;
	visibleDuration?: number;
	monitorElements: Record<string, any>[];
};

type MonitorDataType = `${Events}`;

interface MonitorDataInternal extends MonitorDataAll {
	type: Events.INTERNAL;
	data: any;
}

interface MonitorDataBasic extends MonitorDataAll {
	type: Events.BASIC;
	data: any;
}

interface MonitorDataCustom extends MonitorDataAll {
	type: Events.CUSTOM;
	data: any;
}

interface MonitorDataError extends MonitorDataAll {
	type: Events.ERROR;
	data: any;
}

interface MonitorDataPerformance extends MonitorDataAll {
	type: Events.PERFORMANCE;
	data: any;
}

interface MonitorDataUnHandledReject extends MonitorDataAll {
	type: Events.UN_HANDLED_REJECTION;
	data: any;
}
interface MonitorDataWhiteScreen extends MonitorDataAll {
	type: Events.WHITE_SCREEN;
	data: any;
}

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
