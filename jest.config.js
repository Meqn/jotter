/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
	preset: 'ts-jest',
	testEnvironment: 'jsdom', // 'node'
	roots: ['<rootDir>'],
	setupFilesAfterEnv: ['@testing-library/jest-dom'],
	setupFiles: ['jest-canvas-mock'],
	testMatch: ['**/__tests__/**/*.[jt]s', '**/?(*.)+(spec|test).[jt]s'],
	transform: {
		'^.+\\.tsx?$': ['ts-jest', { useESM: true }],
		'^.+\\.jsx?$': 'babel-jest',
	},
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'^@lib/(.*)$': '<rootDir>/libs/$1',
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
	// collectCoverage: true, // 是否显示覆盖率报告
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov'],
}
