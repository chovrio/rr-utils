import lifecycleInstance, { Lifecycle, StateChangeEvent } from 'page-lifecycle';
import {
	ActivityEvent,
	CustomEvent,
	DEBOUNCE_TIMEOUT,
	DEFAULT_INTERNAL,
	Events,
	INACTIVE_TIMEOUT,
	LIFECYCLE_EVENT,
	PAGE_STATS_CACHE_KEY,
	TriggerState
} from './const';
import EventEmitter, { EmitterFunction } from './event-emitter';
import { Logger } from './logger';
import { Page } from './page';
import { Router } from './router';
import { MonitorData, MonitorOptions, UrlChangeEvent, WindowTimer } from './types';
import {
	DebouncedFunction,
	debounce,
	generateUniqueId,
	getPageUniqKey,
	isContainer,
	isLocalStorageSupported,
	onLoad,
	parseQueryObject,
	safeJsonParse
} from './utils';

const defaultMonitorOptions: MonitorOptions = {
	consumer: console.log,
	shouldMonitorElem: false,
	internal: DEFAULT_INTERNAL,
	triggerOn: TriggerState.EXIT,
	inactiveTimeout: INACTIVE_TIMEOUT
};

export class Monitor {
	private curPage?: Page;
	private router: Router;
	private logger: Logger;
	private ee: EventEmitter;
	private uniqueId!: string;
	private lifecycle!: Lifecycle;
	private options: MonitorOptions;

	private consumer!: (data: any) => void;
	private onLoadListener!: EmitterFunction;
	private inactiveTimerHandle?: WindowTimer;
	private listeners: Record<string, EmitterFunction>;
	private lifecycleHandler!: (event: StateChangeEvent) => void;
	private monitorActivityHandler!: DebouncedFunction<(e: any) => void>;

	constructor(options: MonitorOptions) {
		this.ee = new EventEmitter();
		this.logger = new Logger();
		this.router = new Router();
		this.listeners = {};
		this.lifecycle = lifecycleInstance;
		this.options = {
			internal: options.internal || defaultMonitorOptions.internal,
			consumer: options.consumer || defaultMonitorOptions.consumer,
			inactiveTimeout: options.inactiveTimeout || defaultMonitorOptions.inactiveTimeout,
			shouldMonitorElem: options.shouldMonitorElem || defaultMonitorOptions.shouldMonitorElem,
			triggerOn: options.triggerOn || defaultMonitorOptions.triggerOn
		};
		this.consumer = this.options.consumer;
		this.initEvents();
		this.initRouter();
		this.initLifecycle();
		this.initErrorCatch();
		this.initWhiteScreen();
		this.initLoadListener();
		this.monitorActivityEvents();
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
	public addListener(event: string, listener: EmitterFunction) {
		this.ee.on(event, listener);
		this.listeners[event] = listener;
	}

	/**
	 * 移除事件监听
	 * @param event 事件名
	 */
	public removeEventListener(event: string) {
		this.ee.off(event, this.listeners[event]);
		delete this.listeners[event];
	}

	/**
	 * 触发事件回调
	 * @param event 事件名
	 * @param data 参数
	 */
	dispatchEvent(event: string, data?: MonitorData) {
		if (!this.listeners[event]) return;
		this.ee.emit(event, data);
		this.logger.debug('dispatchEvent', event, data);
	}

	/**
	 * 移除所有自定义事件的监听
	 */
	public removeAllListeners() {
		Object.keys(this.listeners).forEach((event: string) => {
			this.removeEventListener(event);
		});
	}

	/**
	 * 卸载所有监听函数
	 */
	destroy() {
		this.logger.debug('destroy');
		window.removeEventListener('load', this.onLoadListener);
		Object.values(Events).forEach(event => {
			this.removeEventListener(event);
		});
		this.removeAllListeners();
		this.removeMonitorActivityEvents();
	}

	/**
	 * 初始化所有自定义事件
	 */
	private initEvents() {
		Object.values(Events).forEach(event => {
			this.addListener(event, this.consumer);
		});
	}

	/**
	 * 初始化 PageLifecycle
	 * @private
	 */
	private initLifecycle() {
		this.lifecycleHandler = (event: StateChangeEvent) => {
			this.logger.debug('页面状态改变: ', event.newState, event.oldState);
			switch (event.newState) {
				case 'hidden':
					this.handleHiddenState();
					break;
				case 'terminated':
					this.handleTerminatedState();
					break;
				case 'active':
				case 'passive':
					this.handlePageVisibleState();
					break;
			}
		};
		this.lifecycle.addEventListener(LIFECYCLE_EVENT, this.lifecycleHandler);
	}

	/**
	 * 添加对页面初始化 load 事件的监听
	 * @private
	 */
	private initLoadListener() {
		const loadListener = () => {
			this.initBasic();
			this.onPageEnter();
			this.initPerformance();
		};

		window.addEventListener('load', loadListener);

		this.onLoadListener = loadListener;
	}

	/**
	 * 初始化并触发基本事件
	 */
	private async initBasic() {
		const uniqueId = await generateUniqueId();
		this.uniqueId = uniqueId;
		const data: MonitorData = {
			type: Events.BASIC,
			data: [],
			userId: uniqueId,
			pagePath: window.location.pathname,
			timestamp: new Date().toISOString()
		};
		this.dispatchEvent(Events.BASIC, data);
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
						value: t.redirectEnd - t.redirectStart
					},
					{
						key: 'AppCache',
						desc: '\u68c0\u67e5\u672c\u5730\u7f13\u5b58\u7684\u8017\u65f6',
						value: t.domainLookupStart - t.fetchStart
					},
					{
						key: 'DNS',
						desc: 'DNS\u67e5\u8be2\u7684\u8017\u65f6',
						value: t.domainLookupEnd - t.domainLookupStart
					},
					{
						key: 'TCP',
						desc: 'TCP\u8fde\u63a5\u7684\u8017\u65f6',
						value: t.connectEnd - t.connectStart
					},
					{
						key: 'Waiting(TTFB)',
						desc: '\u4ece\u5ba2\u6237\u7aef\u53d1\u8d77\u8bf7\u6c42\u5230\u63a5\u6536\u5230\u54cd\u5e94\u7684\u65f6\u95f4 / Time To First Byte',
						value: t.responseStart - t.requestStart
					},
					{
						key: 'Content Download',
						desc: '\u4e0b\u8f7d\u670d\u52a1\u7aef\u8fd4\u56de\u6570\u636e\u7684\u65f6\u95f4',
						value: t.responseEnd - t.responseStart
					},
					{
						key: 'HTTP Total Time',
						desc: 'http\u8bf7\u6c42\u603b\u8017\u65f6',
						value: t.responseEnd - t.requestStart
					},
					{
						key: 'DOMContentLoaded',
						desc: 'dom\u52a0\u8f7d\u5b8c\u6210\u7684\u65f6\u95f4',
						value: t.domContentLoadedEventEnd - r
					},
					{
						key: 'Loaded',
						desc: '\u9875\u9762load\u7684\u603b\u8017\u65f6',
						value: t.loadEventEnd - r
					}
				];

				// 只对25%的用户进行上报
				if (Math.random() > 0.75) {
					this.dispatchEvent(Events.PERFORMANCE, {
						type: Events.PERFORMANCE,
						data: n
					});
				}
			}
		});
		observer.observe({ entryTypes: ['navigation'] });
	}
	/**
	 * 初始化错误处理上报
	 * @private
	 */
	private initErrorCatch() {
		window.addEventListener('error', e => {
			const data: MonitorData = {
				type: Events.ERROR,
				data: {
					reason: e.message,
					error: e.error,
					timestamp: e.timeStamp
				}
			};
			this.dispatchEvent(Events.ERROR, data);
		});

		window.addEventListener('unhandledrejection', e => {
			const data: MonitorData = {
				type: Events.UN_HANDLED_REJECTION,
				data: {
					reason: e.reason,
					error: e.type,
					timestamp: e.timeStamp
				}
			};
			this.dispatchEvent(Events.UN_HANDLED_REJECTION, data);
		});
	}

	/**
	 * 初始化白屏检测
	 */
	private initWhiteScreen() {
		let emptyPoints = 0;
		onLoad(() => {
			// 页面加载完毕初始化
			for (let i = 1; i <= 9; i++) {
				const xElements = document.elementsFromPoint((window.innerWidth * i) / 10, window.innerHeight / 2);
				let yElements = document.elementsFromPoint(window.innerWidth / 2, (window.innerHeight * i) / 10);
				isContainer(xElements[0]) && emptyPoints++;
				// 中心点只计算一次
				if (i !== 5) {
					isContainer(yElements[0]) && emptyPoints++;
				}
			}
			// 17 个点都是容器节点算作白屏
			if (emptyPoints === 17) {
				const data: MonitorData = {
					type: Events.WHITE_SCREEN,
					data: {
						userId: this.uniqueId,
						pagePath: window.location.pathname,
						timestamp: new Date().toISOString(),
						error: '白屏'
					}
				};
				this.dispatchEvent(Events.WHITE_SCREEN, data);
			}
		});
	}

	/**
	 * 初始化路由监听
	 */
	private initRouter() {
		this.router.onUrlChange(event => {
			this.handlePageChange(event);
		});
	}

	/**
	 * 监控用户活跃事件
	 */
	private monitorActivityEvents() {
		const activeHandler = debounce(e => {
			// 如果活跃事件被触发，则清除当前的不活跃定时器并开启一个新的不活跃定时
			window.clearTimeout(this.inactiveTimerHandle);
			this.startInactiveTimer();
			this.curPage?.onActive();

			// 自身是否存在
			const single = e.target.hasAttribute('data-monitor-name') as HTMLElement;
			// 外层是否存在
			const outerElem = e.target.closest('[data-monitor-name]') as HTMLElement;
			if (single) {
				this.curPage?.setCurMonitorElem(e.target.getAttribute('data-monitor-id')!);
			} else if (outerElem) {
				this.curPage?.setCurMonitorElem(outerElem.getAttribute('data-monitor-id')!);
			} else {
				this.curPage?.resetCurMonitorElem();
			}
		}, DEBOUNCE_TIMEOUT);
		Object.values(ActivityEvent).forEach(value => {
			window.addEventListener(value, activeHandler);
		});
		this.monitorActivityHandler = activeHandler;
	}

	/**
	 * 解绑用户活跃事件
	 */

	private removeMonitorActivityEvents() {
		Object.values(ActivityEvent).forEach(value => {
			window.removeEventListener(value, this.monitorActivityHandler);
		});
	}

	/**
	 * 开启页面非活跃定时器
	 * @private
	 */
	private startInactiveTimer() {
		// 非活跃定时器仅在页面可见时触发
		if (document.visibilityState === 'visible') {
			this.inactiveTimerHandle = window.setTimeout(() => {
				this.curPage?.onInActive();
				this.dispatchEvent(CustomEvent.INACTIVE, {
					type: CustomEvent.INACTIVE,
					data: { desc: '用户不活跃' }
				} as MonitorData);
			}, this.options.inactiveTimeout);
		}
	}

	/**
	 * 处理新页面的进入
	 * @param event Router 传递的 UrlChangeEvent
	 * @private
	 */
	private onPageEnter(event?: UrlChangeEvent) {
		const { shouldMonitorElem, monitorElemConfig } = this.options;
		const savedData = isLocalStorageSupported() ? localStorage.getItem(PAGE_STATS_CACHE_KEY) : undefined;
		if (savedData) this.triggerPageViewEvent(safeJsonParse(savedData));

		this.removePageStatsCache();
		this.curPage = event
			? event.curUrl &&
				new Page({
					url: event.curUrl,
					prevUrl: event.preUrl,
					path: event.curUrl.path,
					shouldMonitorElem,
					monitorElemConfig
				})
			: new Page({
					path: window.location.pathname,
					url: {
						path: window.location.pathname,
						href: window.location.href,
						hash: window.location.hash,
						host: window.location.host,
						port: window.location.port,
						query: parseQueryObject(window.location.search),
						pathWithHash: window.location.pathname + window.location.hash
					},
					shouldMonitorElem,
					monitorElemConfig
				});

		this.curPage?.onEnter();
		this.startInactiveTimer();
		this.dispatchEvent(CustomEvent.ENTER, this.curPage?.generatePvEvent(CustomEvent.ENTER));
		!event && this.dispatchEvent(CustomEvent.LOAD, this.curPage?.generatePvEvent(CustomEvent.LOAD));
	}

	/**
	 * 处理单页面应用路由变化
	 * @param event Router 传递的 UrlChangeEvent
	 * @private
	 */
	private handlePageChange(event: UrlChangeEvent) {
		const uniqKey = getPageUniqKey(this.options.pageUniqKey);
		if (this.curPage && this.curPage.currUrl?.[uniqKey] === event.curUrl?.[uniqKey]) return;

		// 若存在上一页面，将其置为 terminated 状态，然后触发新页面的 enter 事件
		if (this.curPage) {
			this.handleHiddenState();
			this.handleTerminatedState();
		}
		this.onPageEnter(event);
	}

	/**
	 * 处理页面可见的生命周期 active 和 passive
	 * @private
	 */
	private handlePageVisibleState() {
		// 页面可见
		this.curPage?.onVisible();
		// 因为页面活跃，所以不用缓存
		this.removePageStatsCache();
	}

	/**
	 * 处理页面 hidden 状态
	 */
	private handleHiddenState() {
		window.clearTimeout(this.inactiveTimerHandle);

		this.curPage?.onInActive();
		this.curPage?.onInVisible();

		// hidden 状态可能由于页面被回收或用户清理浏览器进程触发，所以需要将当前页面信息缓存下来，防止丢失
		this.cachePageStats();

		// hidden 状态意味着页面不再活跃，因此同时触发 inactive 事件
		this.dispatchEvent(CustomEvent.INACTIVE, this.curPage?.generatePvEvent(CustomEvent.INACTIVE));
		this.dispatchEvent(CustomEvent.HIDDEN, this.curPage?.generatePvEvent(CustomEvent.HIDDEN));

		if ([TriggerState.HIDDEN, TriggerState.INACTIVE].includes(this.options.triggerOn!)) {
			this.triggerPageViewEvent();
		}
	}

	/**
	 * 处理页面 terminated
	 */
	private handleTerminatedState() {
		this.dispatchEvent(CustomEvent.EXIT, this.curPage?.generatePvEvent(CustomEvent.EXIT));

		this.options.triggerOn === TriggerState.EXIT && this.triggerPageViewEvent();

		// EXIT 时清空页面统计数据
		this.curPage?.onExit();

		delete this.curPage;

		// 如果进入 terminated 状态，说明网页正常退出，无需缓存，因此清除 localStorage
		this.removePageStatsCache();
	}

	/**
	 * 触发 pageview 事件
	 * @param event pageview 事件
	 * @private
	 */
	private triggerPageViewEvent(event?: MonitorData) {
		this.dispatchEvent(CustomEvent.PAGE_VIEW, event || this.curPage?.generatePvEvent(CustomEvent.PAGE_VIEW));
		window.clearTimeout(this.inactiveTimerHandle);
	}

	private cachePageStats() {
		try {
			const value = this.curPage?.generatePvEvent(CustomEvent.EXIT);
			value && isLocalStorageSupported() && localStorage.setItem(PAGE_STATS_CACHE_KEY, JSON.stringify(value));
		} catch (error) {
			this.logger.debug('localStorage setItem \n', error);
		}
	}

	/**
	 * 移除当前存在 localStorage 中的页面数据缓存
	 * @private
	 */
	private removePageStatsCache() {
		isLocalStorageSupported() && localStorage.removeItem(PAGE_STATS_CACHE_KEY);
	}
}
