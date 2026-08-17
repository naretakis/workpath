import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Vitest configuration — added by the W0-slice.
 *
 * See docs/hr1-readiness/waves/README.md § "The W0-slice, and why it exists".
 * The slice exists because W2a ships the no-verdict guard test (ADR-0007 Tier 1)
 * and there was no test runner: package.json had no `test` script, and
 * `@types/jest` was the only reason src/lib/utils/__tests__/imageCompression.test.ts
 * typechecked. It could never execute.
 *
 * Scope is deliberately minimal. Characterization tests, the migration test, and
 * the dead-code sweep belong to W0 proper.
 */
export default defineConfig({
  test: {
    // jsdom, not node: the code under test reaches for FileReader, Image, and
    // document.createElement("canvas"), and W2a's guard test renders components
    // with @testing-library/react.
    environment: "jsdom",

    // Deliberately NOT `globals: true`. Tests import describe/it/expect from
    // "vitest" explicitly. @types/jest was removed in this slice because it
    // declared the same globals with incompatible shapes and broke
    // `tsc --noEmit`; explicit imports mean nothing has to be re-declared
    // ambiently to replace it, and compilerOptions.types stays untouched.
    setupFiles: ["./vitest.setup.ts"],

    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      // Mirrors compilerOptions.paths in tsconfig.json.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
