/**
 * Vitest setup — added by the W0-slice.
 *
 * Registers @testing-library/jest-dom's custom matchers (toBeInTheDocument,
 * toHaveTextContent, and friends). W2a's no-verdict guard asserts on rendered
 * output and needs them.
 */
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

import "@testing-library/jest-dom/vitest";

/**
 * Unmount between tests.
 *
 * @testing-library/react normally registers this itself, but only when a global
 * `afterEach` exists. This project runs with `globals: false` and imports test
 * helpers explicitly, so auto-cleanup never fires and the jsdom document
 * accumulates every render in the file.
 *
 * That matters more than usual here: the no-verdict guard asserts against
 * `document.body.textContent`, so leaked DOM from an earlier test would make one
 * component's copy fail another component's assertion — or, worse, let a real
 * verdict hide behind a passing test elsewhere.
 */
afterEach(() => {
  cleanup();
});
