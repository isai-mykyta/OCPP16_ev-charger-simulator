module.exports = {
  preset: "ts-jest",
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  collectCoverageFrom: [
    "**/*.(t|j)s"
  ],
  setupFiles: ['reflect-metadata'],
  coverageDirectory: "../coverage",
  testTimeout: 30000,
  maxWorkers: 1,
  testEnvironment: "node",
  coveragePathIgnorePatterns: [
    "src/api/api.dtos.ts",
    "src/api/api.router.tes",
    "src/api/index.ts",
    "src/connector/index.ts",
    "src/connector/types.ts",
    "src/logger/index.ts",
    "src/logger/types.ts",
    "src/models",
    "src/ocpp/handlers/index.ts",
    "src/ocpp/schemas",
    "src/ocpp/index.ts",
    "src/ocpp/types.ts",
    "src/utils/constants.ts",
    "src/utils/index.ts",
    "src/simulator/types.ts",
    "src/simulator/index.ts",
    "src/websocket/index.ts",
    "src/index.ts"
  ]
};