import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ignore generated files:
    "public/sw.js",
    "public/**/*.js",
    // Ignore Firebase Functions build output:
    "functions/lib/**",
    "firebase-functions/lib/**",
    // Ignore test coverage reports:
    "coverage/**",
  ]),
]);

export default eslintConfig;
