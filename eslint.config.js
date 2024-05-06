import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

const config = [...tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended), eslintConfigPrettier];

export default config;
