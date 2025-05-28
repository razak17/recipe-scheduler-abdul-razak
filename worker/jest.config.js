module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['./src'],
	testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
	transform: {
		'^.+\\.ts$': 'ts-jest'
	},
	coverageDirectory: 'coverage',
	collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/index.ts', '!src/**/*.types.ts'],
	coverageThreshold: {
		global: {
			branches: 70,
			functions: 80,
			lines: 80,
			statements: 80
		}
	}
};
