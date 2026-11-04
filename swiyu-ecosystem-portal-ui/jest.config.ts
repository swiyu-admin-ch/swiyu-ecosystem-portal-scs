export default {
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage/sonarQube',
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/app/api/generated/**'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  },
  testResultsProcessor: 'jest-sonar-reporter'
};