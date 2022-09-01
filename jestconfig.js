const semver = require("semver");

const nodeIsLower = semver.lt(process.versions.node, '14.20.0');

const coverageDefaultExclude = ['src/**/*.ts', '!src/**/index(.|.d.)ts'];

module.exports = {
  "transform": {
    "^.+\\.(t|j)sx?$": "ts-jest"
  },
  "testRegex": "(/tests/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json", "node"],
  "modulePathIgnorePatterns": ["tests/performance", ...(nodeIsLower ? ['tests/unit/ContextAsyncHooks.test.ts'] : [])],
  "verbose": true,
  "silent": true,
  "collectCoverage": true,
  "collectCoverageFrom": [...coverageDefaultExclude, ...(nodeIsLower ? ['!src/context/ContextAsyncHooks.ts'] : [])],
  "coverageThreshold": {
    "global": {
      "statements": 92,
      "branches": 69,
      "functions": 100,
      "lines": 90
    }
  }
}
