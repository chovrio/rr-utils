import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			fileName: 'hooks'
		},
		rollupOptions: {
			external: ['react', 'react-dom'],
			output: [
				{
					format: 'esm'
				}
			]
		}
	}
});
