import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	build: {
		outDir: 'lib',
		lib: {
			entry: './src/index.ts',
			formats: ['es', 'cjs']
		}
	},
	plugins: [dts()]
});
