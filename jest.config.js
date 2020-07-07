module.exports = {
  "roots": [
    "<rootDir>/test"
  ],
  "collectCoverage":true,
  "coverageDirectory": "./coverage/",
  "coverageReporters": ["json", "html"],
  "moduleDirectories": ["node_modules"],
  "reporters": ["default", "jest-junit"],
  "verbose":true,
  "transform": {
    "^.+\\.js$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest"
  }
}