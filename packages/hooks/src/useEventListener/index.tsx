import { useEffect } from 'react';
import { useLatest } from '..';
const useEventListener = (event: keyof WindowEventMap, handler: (...e: any) => void, target?: any) => {
	const handlerRef = useLatest(handler);

	useEffect(() => {
		// 支持 useRef 和 DOM 节点
		let targetElement: any;
		if (!target) {
			targetElement = window;
		} else if ('current' in target) {
			target = target.current;
		} else {
			targetElement = target;
		}
		// 防止没有 addEventListener 这个属性
		if (!target?.addEventListener) return;

		const useEventListener = (event: Event) => handlerRef.current(event);
		targetElement.addEventListener(event, useEventListener);
		return () => {
			targetElement.removeEventListener(event, useEventListener);
		};
	}, [event, target]);
};

export default useEventListener;
