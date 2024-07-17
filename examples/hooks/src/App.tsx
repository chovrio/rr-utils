import { Button } from 'antd';
import { combineReducers, createStore } from 'redux';
import { useSyncExternalStore } from 'react';

const reducer = (state: number = 1, action: any) => {
	switch (action.type) {
		case 'ADD':
			return state + 1;
		case 'DEL':
			return state - 1;
		default:
			return state;
	}
};

/** 组册reducer，并创建store */
const rootReducer = combineReducers({ count: reducer });
const store = createStore(rootReducer, { count: 1 });

const Index = () => {
	// 订阅
	const state = useSyncExternalStore(store.subscribe, () => store.getState().count);
	return (
		<div>
			<div>数据源：{state}</div>
			<Button type="primary" onClick={() => store.dispatch({ type: 'ADD' })}>
				加一
			</Button>
			<Button
				style={{
					marginLeft: 8
				}}
				type="primary"
				onClick={() => store.dispatch({ type: 'DEL' })}
			>
				减一
			</Button>
		</div>
	);
};

export default Index;
