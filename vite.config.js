/* global process */
import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	base: process.env.PUBLIC_PATH ? process.env.PUBLIC_PATH : '/',
	build: {
		minify: true,
		rollupOptions: {
			input: {
				'cis-slider': 'src/main.ts',
				'index.html': 'index.html',
			},
		},
	},
	css: {
		postcss: {
			plugins: [autoprefixer({})],
		},
		preprocessorOptions: {
			scss: {
				quietDeps: true,
				loadPaths: [path.join(__dirname, 'node_modules/@nciocpl/ncids-css/packages'), path.join(__dirname, 'node_modules/@nciocpl/ncids-css/uswds-packages')],
			},
		},
	},
});
