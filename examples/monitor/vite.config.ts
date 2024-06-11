import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import commonjs from 'vite-plugin-commonjs';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [commonjs(), react()]
});
