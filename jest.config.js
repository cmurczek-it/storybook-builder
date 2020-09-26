module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/testing'],
  watchPathIgnorePatterns: ['<rootDir>/testing'],
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.spec.json"
    }
  }
};
