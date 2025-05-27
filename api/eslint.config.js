import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname
});

const eslintConfig = [
	...compat.extends('plugin:@typescript-eslint/recommended'),
	{ ignores: ['build/*', '**/__tests__/**/*.ts'] },
	{
		rules: {
			'@typescript-eslint/no-unused-vars': 0,
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }]
		}
	}
];

export default eslintConfig;
