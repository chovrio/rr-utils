import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { useUnmountedRef } from '..';

function useSafeState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S | undefined>>];
function useSafeState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
function useSafeState<S>(initialState?: S | (() => S)) {
	const unmountedRef: { current: boolean } = useUnmountedRef();
	const [state, setState] = useState(initialState);
	const setCurrentState = useCallback((currentState: any) => {
		if (unmountedRef.current) return;
		setState(currentState);
	}, []);
	return [state, setCurrentState] as const;
}

export default useSafeState;
