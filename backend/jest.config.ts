import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/test/**/*.test.ts"],
  clearMocks: true,
  setupFiles: ["<rootDir>/test/jest.setup.ts"]
};

export default config;
