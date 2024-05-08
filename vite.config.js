/* global process */
/* global __dirname */
import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer';
import path from 'path';

export default defineConfig({
	base: process.env.PUBLIC_PATH ? process.env.PUBLIC_PATH : '/',
	build: {
		minify: true,
		cssMinify: true,
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
				includePaths: [path.join(__dirname, 'node_modules/@nciocpl/ncids-css/packages'), path.join(__dirname, 'node_modules/@nciocpl/ncids-css/uswds-packages')],
			},
		},
	},
});
