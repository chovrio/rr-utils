// src/page-lifecycle.d.ts

declare module 'page-lifecycle' {
	type PageState = string; // 根据实际的PageState类型定义

	export interface StateChangeEvent extends Event {
		newState: PageState;
		oldState: PageState;
		originalEvent: Event;
	}

	export interface Lifecycle {
		addEventListener(event: 'statechange', callback: (event: StateChangeEvent) => void): void;
		removeEventListener(event: 'statechange', callback: (event: StateChangeEvent) => void): void;
		state: PageState;
		// 根据实际API添加更多方法和属性
	}

	const lifecycleInstance: Lifecycle;

	export default lifecycleInstance;
}
