'use strict';

module.exports = {
  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: ['/pkg/', '/node_modules/'],

  // The glob patterns Jest uses to detect test files
  testMatch: ['**/__tests__/**/*.spec.[jt]s?(x)'],
};
