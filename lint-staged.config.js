// lint-staged.config.js
export default {
	'**/*.ts': () => 'tsc -p tsconfig.json --noEmit',
	'**/*.{js,ts}': ['eslint --max-warnings 0 --fix'],
	'*': ['prettier --write --ignore-unknown'],
};
