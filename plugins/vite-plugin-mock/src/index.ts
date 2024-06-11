import { createServer } from './server';
import { parseTypeScriptExports } from './utils';
import Mock, { MockOptions } from '@rr-utils/mock';
import fs from 'fs';

type Method = 'get' | 'post' | 'put' | 'delete' | 'patch';

export interface Request {
	url: string;
	name: string;
	method: Method;
	response: (origin: any) => any;
	option?: MockOptions;
}
function MockPlugin(path: string) {
	const options = eval(parseTypeScriptExports(path)); // ignore_security_alert RCE
	const source = fs.readFileSync(path, 'utf-8');
	return {
		name: 'vite-plugin-mock',
		buildStart() {
			console.log('mock服务已启动');
			const mock = new Mock(source);
			createServer(options, mock);
		}
	};
}

export { MockPlugin };

export default MockPlugin;
