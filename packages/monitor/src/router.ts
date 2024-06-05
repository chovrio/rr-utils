import EventEmitter from './event-emitter';
import { Logger } from './logger';
import { RouterEvents, TriggeringMethod } from './const';
import { RouterOptions, URL_CHANGE_EVENT, UrlChangeEvent, UrlObj } from './types';
import { parseQueryObject } from './utils';

export class Router {
	private curUrl!: string;
	private readonly triggerOnInit!: boolean;
	private readonly ee!: EventEmitter;
	private readonly logger!: Logger;
	private firstTriggering!: boolean;
	private mode!: TriggeringMethod;
	private listener?: (event: UrlChangeEvent) => void;
	private originPushState!: typeof history.pushState;
	private originReplaceState!: typeof history.replaceState;
	private readonly listeners!: Record<string, ((event: Event) => void) | undefined>;

	constructor(options: RouterOptions = { logger: new Logger() }) {
		const { mode, triggerOnInit, logger } = options;
		if (window) {
			this.mode = mode
				? Object.values(TriggeringMethod).includes(mode)
					? mode
					: TriggeringMethod.BOTH
				: TriggeringMethod.BOTH;
			this.triggerOnInit = triggerOnInit || false;
			this.firstTriggering = true;
			this.ee = new EventEmitter();
			this.curUrl = window.location.href;
			this.listeners = {};
			this.logger = logger;
		} else {
			logger.error('window is undefined');
		}
	}

	public onUrlChange(callback: (event: UrlChangeEvent) => void): void {
		if (!this.ee) return;

		if (this.listener) {
			this.removeAllListeners();
		}

		this.hijackHistoryApis();
		this.registerListeners();

		this.firstTriggering = true;
		this.listener = callback;
		this.ee.on(URL_CHANGE_EVENT, this.listener);

		// 初始化时是否需要触发
		this.triggerOnInit && this.dispatchUrlChangeEvent();
	}

	/**
	 * 移除所有事件监听器
	 */
	public removeAllListeners() {
		Object.values(RouterEvents).forEach(eventName => {
			const listener = this.listeners[eventName];
			listener && window.removeEventListener(eventName, listener);
			this.listeners[eventName] = undefined;
		});
		window.history.pushState = this.originPushState;
		window.history.replaceState = this.originReplaceState;

		this.ee.removeAllListeners();
		this.listener = undefined;
	}

	/**
	 * 改变监听模式
	 * @param newMode {TriggeringMethod}
	 */
	public changeListeningMode(newMode: TriggeringMethod): void {
		if (Object.values(TriggeringMethod).includes(newMode)) {
			this.mode = newMode;
		} else {
			console.error(`[PuzzleRouterError] invalid mode. Proceeding with current mode: ${this.mode}`);
		}
	}
	/**
	 * 劫持原生 history api
	 */
	private hijackHistoryApis() {
		this.originPushState = window.history.pushState;
		this.originReplaceState = window.history.replaceState;

		window.history.pushState = this.createHistoryEvent(RouterEvents.PUSH_STATE);
		window.history.replaceState = this.createHistoryEvent(RouterEvents.REPLACE_STATE);
	}

	/**
	 * 劫持单个 history api
	 * @param type history 函数名
	 * @returns 劫持函数
	 */
	private createHistoryEvent<T extends keyof History>(type: T) {
		// 首先获得原函数
		const origin = history[type];
		// 返回一个函数
		return function (this: any) {
			// 新函数的this为原函数
			const res = origin.apply(this, arguments);
			// 新建一个事件为传入参数
			const e = new Event(type);
			// 通过window派发这个事件(只有派发后才能监听到)
			window.dispatchEvent(e);
			// 返回新函数
			return res;
		};
	}

	/**
	 * 注册监听器
	 */
	private registerListeners() {
		Object.values(RouterEvents).forEach(eventName => {
			const listener = (event: Event) => {
				this.dispatchUrlChangeEvent(event);
			};
			this.listeners[eventName] = listener;
			window.addEventListener(eventName, listener);
		});
	}

	/**
	 * 构建 UrlChangeEvent
	 * @param originEvent {Event}
	 */
	private dispatchUrlChangeEvent(originEvent?: Event) {
		const newEvent: UrlChangeEvent | undefined = this.buildUrlChangeEvent(originEvent);
		newEvent && this.ee.emit(URL_CHANGE_EVENT, newEvent);
	}

	private buildUrlChangeEvent(event?: Event): UrlChangeEvent | undefined {
		let urlChangeEvent: UrlChangeEvent | undefined;
		let newUrlObject: URL | undefined;
		let oldUrlObject: URL | undefined;
		try {
			newUrlObject = new URL(window.location.href);
			oldUrlObject = new URL(this.curUrl);

			// 初始化时触发
			if (this.firstTriggering && this.triggerOnInit && this.curUrl) {
				this.firstTriggering = false;
				urlChangeEvent = {
					curUrl: this.buildCustomUrlObject(newUrlObject)
				};
			}
			// 其余时候触发 前提是新旧 url 不等
			else if (newUrlObject.href !== oldUrlObject.href) {
				const isHashChanged: boolean = newUrlObject.hash !== oldUrlObject.hash;
				const isPathChanged: boolean = newUrlObject.pathname !== oldUrlObject.pathname;
				const triggeredBy: TriggeringMethod =
					isHashChanged && isPathChanged
						? TriggeringMethod.BOTH
						: isHashChanged
							? TriggeringMethod.HASH
							: TriggeringMethod.HISTORY;

				if (triggeredBy === TriggeringMethod.BOTH || this.mode === TriggeringMethod.BOTH || triggeredBy === this.mode) {
					urlChangeEvent = {
						triggeredBy,
						curUrl: this.buildCustomUrlObject(newUrlObject),
						preUrl: this.buildCustomUrlObject(oldUrlObject),
						originEvent: event ? event : undefined
					};
				}
			}
		} catch (error) {
			this.logger.error(`解析 url (${this.curUrl} | ${window.location.href})出错: ${error}`);
		}
		this.curUrl = window.location.href;
		return urlChangeEvent;
	}

	/**
	 * 根据 URL 构建自定义 UrlObj
	 * @param originalObj {URL}
	 * @returns {UrlObj}
	 */
	private buildCustomUrlObject(originalObj: URL): UrlObj | undefined {
		return (
			originalObj && {
				href: originalObj.href,
				hash: originalObj.hash,
				path: originalObj.pathname,
				host: originalObj.hostname,
				port: originalObj.port,
				pathWithHash: originalObj.pathname + originalObj.hash,
				query: parseQueryObject(originalObj.search)
			}
		);
	}
}
