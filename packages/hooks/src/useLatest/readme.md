useLatest: 永远返回最新的值，可以避免闭包问题

```tsx
import { useState, useEffect } from 'react';

export default () => {
	const [count, setCount] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			console.log('count:', count);
			setCount(count + 1);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	return (
		<>
			<div>自定义Hooks：useLatestt</div>
			<div>count: {count}</div>
		</>
	);
};
```
