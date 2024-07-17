import { useCreation, useLatest, useUpdate } from '..';

const observer = <T extends Record<string, any>>(initialVal: T, cb: () => void): T => {
	const proxy = new Proxy<T>(initialVal, {
		get(target, key, receiver) {
			const res = Reflect.get(target, key, receiver);
			return typeof res === 'object' ? observer(res, cb) : Reflect.get(target, key);
		},
		set(target, key, value) {
			const ret = Reflect.set(target, key, value);
			cb();
			return ret;
		}
	});
	return proxy;
};

const useReactive = <T extends Record<string, any>>(initialState: T): T => {
	const ref = useLatest<T>(initialState);
	const update = useUpdate();

	const state = useCreation(() => {
		return observer(ref.current, () => {
			update();
		});
	}, []);

	return state;
};

export default useReactive;
