/* global process */
import { defineConfig } from 'vite';

export default defineConfig({
	base: process.env.PUBLIC_PATH ? process.env.PUBLIC_PATH : '/',
});
