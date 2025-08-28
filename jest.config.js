const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverage: true,
  collectCoverageFrom: ['./src/**'],
  coverageReporters: ['html'],
  coverageDirectory: './coverage',
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(config);
