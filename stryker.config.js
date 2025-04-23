module.exports = {
  packageManager: 'yarn',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'jest',
  coverageAnalysis: 'perTest',
  mutate: [
    'src/**/*.tsx',
    '!src/**/*.test.tsx',
    '!src/index.tsx',
    '!src/setupTests.ts'
  ],
  jest: {
    configFile: 'jest.config.js'
  }
}; 