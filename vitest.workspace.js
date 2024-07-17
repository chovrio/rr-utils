import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
	'./vitest.config.ts',
	'./packages/hooks/vite.config.ts',
	'./examples/monitor/vite.config.ts'
]);
