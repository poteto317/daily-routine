import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
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
    // Ignore Storybook build output:
    "storybook-static/**",
  ]),
  {
    // tools/配下の.jsファイルはCommonJS（module.exports/require）で書く方針のため、
    // ESM前提のno-require-importsルールを適用しない。
    files: ["tools/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    rules: {
      // 型としてのみ使用する import は必ず `import type` にする（コーディングルール §2 を自動強制）。
      // disallowTypeAnnotations: false は ReturnType<typeof import(...)> 形式を許容するため。
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
          disallowTypeAnnotations: false,
        },
      ],
    },
  },
]);

export default eslintConfig;
