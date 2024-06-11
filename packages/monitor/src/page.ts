import MonitorElement from './element';
import { Logger } from './logger';
import { ObserverDOM } from './observer';
import { ElementInfo, PageOptions, QueryObj, UrlObj } from './types';
import { parseQueryObject } from './utils';

export class Page {
	private readonly url: UrlObj;
	private readonly path: string;
	private readonly prevUrl?: UrlObj;

	private isActive!: boolean;
	private isVisible!: boolean;

	private enterTime!: Date;
	private leaveTime?: Date;
	private lastActiveTime?: Date;
	private lastVisibleTime?: Date;

	private activeDuration!: number;
	private visibleDuration!: number;

	private logger: Logger;
	private options: PageOptions;
	private observer!: MutationObserver;
	private monitorElements!: ElementInfo[];
	private curMonitorElem!: ElementInfo | null;

	constructor(options: PageOptions) {
		const { url, path, prevUrl } = options || {};
		this.url = url;
		this.path = path;
		this.prevUrl = prevUrl;
		this.options = options;
		this.logger = new Logger();
		this.initPageStats();
	}

	/**
	 * 初始化页面状态
	 */
	private initPageStats() {
		this.isActive = false;
		this.isVisible = false;

		this.enterTime = new Date();
		this.activeDuration = 0;
		this.visibleDuration = 0;

		this.monitorElements = [];
		this.curMonitorElem = null;
		if (this.options.shouldMonitorElem) {
			this.observer = ObserverDOM(this.checkElement.bind(this));
		}
	}
	/**
	 * 添加新监控元素
	 * @param elementInfo 元素信息
	 */
	public addElement(elementInfo: ElementInfo) {
		this.monitorElements.push({
			...elementInfo,
			observer: new MonitorElement({
				...elementInfo,
				config: {
					...this.options.monitorElemConfig,
					...elementInfo.config
				}
			})
		});
	}

	/**
	 * 检查 Element 状态
	 * @param elementInfo 元素信息
	 * @param isNew 是否是新元素
	 */
	public checkElement(elementInfo: ElementInfo, isNew: boolean) {
		if (isNew) {
			this.addElement(elementInfo);
		} else {
			const currentNode = this.monitorElements.find(item => item.key === elementInfo.key);
			currentNode?.observer?.checkStatus(true);
		}
	}
	/**
	 * 通过 key 设置当前活跃的模块
	 * @param key element 的唯一标识
	 * @returns
	 */
	public setCurMonitorElem(key: string) {
		if (key === this.curMonitorElem?.key) return;
		const elem = this.monitorElements.find(elem => key === elem.key);
		if (!elem) {
			this.curMonitorElem = null;
			return;
		}
		elem?.observer?.onActive();
		this?.curMonitorElem?.observer?.onInActive();
		this.logger.debug('focus path: 之前活跃的模块', this?.curMonitorElem?.name);
		this.logger.debug('focus path: 现在活跃的模块', elem?.name);
		this.curMonitorElem = elem;
	}

	public resetCurMonitorElem() {
		this.curMonitorElem?.observer?.onInActive();
		this.curMonitorElem = null;
	}

	/**
	 * 进入页面
	 */
	public onEnter() {
		if (document.visibilityState === 'visible') {
			this.onActive();
			this.onVisible();
		}
	}

	/**
	 * 页面进入活跃状态
	 */
	public onActive() {
		if (!this.isActive) {
			this.isActive = true;
			this.lastActiveTime = new Date();
		}
		this.leaveTime = undefined;
		this.getLatestActiveDuration();
		this.options.monitorElemConfig?.bindVisibilityWithActivity && this.toggleElementsVisible(true, true);
	}

	/**
	 * 页面失活
	 */
	public onInActive() {
		this.leaveTime = undefined;
		this.getLatestActiveDuration();
		this.isActive = false;
		this.options.monitorElemConfig?.bindVisibilityWithActivity && this.toggleElementsVisible(false, false);
	}

	/**
	 * 页面可见状态
	 */
	public onVisible() {
		if (!this.isVisible) {
			this.isVisible = true;
			this.lastVisibleTime = new Date();
		}
		this.leaveTime = undefined;
		this.getLatestVisibleDuration();
		!this.options.monitorElemConfig?.bindVisibilityWithActivity && this.toggleElementsVisible(true, true);
	}

	/**
	 * 页面不可见
	 */
	public onInVisible() {
		this.getLatestVisibleDuration();
		this.isVisible = false;
		this.leaveTime = new Date();
		!this.options.monitorElemConfig?.bindVisibilityWithActivity && this.toggleElementsVisible(false, false);
	}

	/**
	 * 离开页面
	 */
	public onExit() {
		this.onExitElements();
	}

	/**
	 * 停止监控当前页面及子元素
	 */
	public onExitElements() {
		this.monitorElements.forEach(elem => {
			const data = elem.observer?.exit();
			return {
				...elem,
				...data
			};
		});
		this.observer?.disconnect();
	}

	public generatePvEvent(type: string) {
		this.getLatestActiveDuration();
		this.getLatestVisibleDuration();

		const monitorElemToReport = this.monitorElements.map(elem => ({
			enterTime: elem?.enterTime,
			leaveTime: elem?.leaveTime,
			visibleDuration: elem?.visibleDuration,
			enterActiveTime: elem?.enterActiveTime,
			leaveActiveTime: elem?.leaveActiveTime,
			activeDuration: elem?.activeDuration,
			event: elem?.event,
			params: elem?.params
		}));

		return {
			type: type,
			currUrl: this.url,
			prevUrl: this.prevUrl,
			path: this.path,
			query: this.query,
			title: document.title,
			enterTime: this.enterTime.getTime(),
			leaveTime: this.leaveTime?.getTime(),
			activeDuration: this.activeDuration,
			visibleDuration: this.visibleDuration,
			monitorElements: monitorElemToReport
		};
	}

	/**
	 *
	 * @param visible 是否可见
	 * @param lazy 是否延迟
	 */
	public toggleElementsVisible(visible: boolean, lazy: boolean) {
		this.monitorElements = this.monitorElements.map(elem => {
			const data = elem.observer?.setVisibleState(visible, lazy);
			return {
				...elem,
				...data
			};
		});
	}

	/**
	 * 获取当前页面路径 string
	 */
	get curPath(): string {
		return this.path;
	}

	/**
	 * 获取当前路径 query 对象
	 */
	get query(): QueryObj {
		return parseQueryObject(location.search);
	}

	/**
	 * 获取当前路径 Url Obj
	 */
	get currUrl(): UrlObj {
		return this.url;
	}

	/**
	 * 获取最后一次活跃时长
	 */
	private getLatestActiveDuration() {
		const now = new Date();
		this.activeDuration += this.isActive
			? this.lastActiveTime
				? now.getTime() - this.lastActiveTime?.getTime()
				: 0
			: 0;
		this.lastActiveTime = now;
	}

	/**
	 * 获取最后一次可见时长
	 */
	private getLatestVisibleDuration() {
		const now = new Date();
		this.visibleDuration += this.lastVisibleTime ? now.getTime() - this.lastVisibleTime?.getTime() : 0;
		this.lastVisibleTime = now;
	}
}
