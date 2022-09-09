const semver = require('semver');

const pickLegacy = () => semver.lt(process.versions.node, '16.17.0');

const coverageDefaultExclude = ['src/**/*.ts', '!src/**/index(.|.d.)ts'];

module.exports = {
  "transform": {
    "^.+\\.(t|j)sx?$": "ts-jest"
  },
  "testRegex": "(/tests/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json", "node"],
  "modulePathIgnorePatterns": ["tests/performance", ...(pickLegacy() ? ['tests/unit/ContextAsyncHooks.test.ts'] : [])],
  "verbose": true,
  "silent": true,
  "collectCoverage": true,
  "collectCoverageFrom": [...coverageDefaultExclude, ...(pickLegacy() ? ['!src/context/ContextAsyncHooks.ts'] : [])],
  "coverageThreshold": {
    "global": {
      "statements": 97,
      "branches": 76,
      "functions": 100,
      "lines": 100
    }
  }
}
