import {
	ELEM_HIDDEN_PER,
	ELEM_TIMEOUT,
	ELEM_VISIBLE_PER,
	STATE_ACTIVE,
	STATE_EXIT,
	STATE_INACTIVE,
	STATE_INVISIBLE,
	STATE_VISIBLE
} from './const';
import { ObserverElem } from './observer';
import { MonitorElemConfig, MonitorElementOptions, WindowTimer } from './types';
import { isVisibleByStyling } from './utils';

const DEFAULT_OPTIONS: MonitorElemConfig = {
	visiblePercent: ELEM_VISIBLE_PER,
	hiddenPercent: ELEM_HIDDEN_PER,
	duration: ELEM_TIMEOUT
};

export type MARK_STATE =
	| typeof STATE_VISIBLE
	| typeof STATE_INVISIBLE
	| typeof STATE_ACTIVE
	| typeof STATE_INACTIVE
	| typeof STATE_EXIT;

class MonitorElement {
	private readonly key: string;
	private readonly name: string;
	private readonly node: Element;
	private readonly config: MonitorElemConfig;
	private observer?: IntersectionObserver;

	private isActive: boolean;
	private isVisible: boolean;

	private enterTime!: number;
	private leaveTime!: number;
	private lastVisibleTime!: number;
	private lastInVisibleTime!: number;
	private visibleDuration: number;

	private enterActiveTime!: number;
	private leaveActiveTime!: number;
	private lastActiveTime!: number;
	private lastInActiveTime!: number;
	private activeDuration: number;

	private ratio: number;
	private activeTimer?: WindowTimer;
	private visibleTimer?: WindowTimer;

	constructor(options: MonitorElementOptions) {
		const { key, node, config, name } = options || {};
		this.key = key;
		this.node = node;
		this.name = name;
		this.config = {
			visiblePercent: config.visiblePercent || DEFAULT_OPTIONS.visiblePercent,
			hiddenPercent: config?.hiddenPercent || DEFAULT_OPTIONS.hiddenPercent,
			duration: config?.duration || DEFAULT_OPTIONS.duration,
			bindVisibilityWithActivity: config?.bindVisibilityWithActivity
		};

		this.isActive = false;
		this.isVisible = false;

		this.activeDuration = 0;
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
				hiddenPercent
			},
			ratio => {
				this.ratio = ratio;
				this.checkStatus(true);
			}
		);
	}

	public exit() {
		this.observer?.disconnect();
		this.node.removeAttribute('data-monitor-id');
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
			// 活跃
			case STATE_ACTIVE: {
				if (this.isActive) return;
				this.isActive = true;
				this.lastActiveTime = time;
				if (!this.enterActiveTime) {
					this.enterActiveTime = time;
				}
				break;
			}
			// 不活跃
			case STATE_INACTIVE: {
				if (!this.isActive) return;
				this.isActive = false;
				this.lastInActiveTime = time;
				this.activeDuration += this.lastInActiveTime - this.lastActiveTime;
				this.leaveActiveTime = time;
				break;
			}
			// 离开
			case STATE_EXIT: {
				this.leaveTime = time;
				this.leaveActiveTime = time;
				if (this.isVisible) {
					this.isVisible = false;
					this.visibleDuration += time - this.lastVisibleTime;
				}
				if (this.isActive) {
					this.isActive = false;
					this.activeDuration += time - this.lastActiveTime;
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
		this.clearLazyVisibleTimer();
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
		this.clearLazyVisibleTimer();
		console.log(this.name, this.isVisible);
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

	public onActive() {
		this.clearLazyActiveTimer();
		if (this.isActive) {
			return this.report;
		}

		this.startActiveTimer(STATE_ACTIVE, this.config.duration!);
	}

	public onInActive() {
		this.clearLazyActiveTimer();
		if (!this.isActive) {
			return this.report;
		}
		this.startActiveTimer(STATE_INACTIVE, this.config.duration!);
	}

	private startVisibleTimer(state: MARK_STATE, time: number) {
		this.clearLazyVisibleTimer();
		const now = Date.now();
		this.visibleTimer = window.setTimeout(() => {
			this.mark(state, now);
		}, time);
	}

	private startActiveTimer(state: MARK_STATE, time: number) {
		this.clearLazyActiveTimer();
		const now = Date.now();
		this.activeTimer = window.setTimeout(() => {
			this.mark(state, now);
		}, time);
	}

	private clearLazyVisibleTimer() {
		window.clearTimeout(this.visibleTimer);
	}

	private clearLazyActiveTimer() {
		window.clearTimeout(this.activeTimer);
	}

	get report() {
		return {
			enterTime: this.enterTime,
			leaveTime: this.leaveTime,
			visibleDuration: this.visibleDuration,

			enterActiveTime: this.enterActiveTime,
			leaveActiveTime: this.leaveActiveTime,
			activeDuration: this.activeDuration
		};
	}
}

export default MonitorElement;
