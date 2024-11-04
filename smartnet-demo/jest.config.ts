module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],

  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/', '<rootDir>/src/test.ts'],
  coverageReporters: ['html', 'text', 'text-summary', 'lcov'],
  coveragePathIgnorePatterns: [
    // NOTICE: If we want to leave something out of the coverage, we should ignore it in the sonar-project.properties. Excluding it here just lowers our sonar coverage
  ],
  moduleNameMapper: {
    '~app/(.*)': '<rootDir>/src/app/$1',
    '~shared/(.*)': '<rootDir>/src/app/shared/$1',
    '~env/(.*)': '<rootDir>/src/environments/$1',
  },
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
