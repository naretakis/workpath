/**
 * Vitest setup — added by the W0-slice.
 *
 * Registers @testing-library/jest-dom's custom matchers (toBeInTheDocument,
 * toHaveTextContent, and friends). W2a's no-verdict guard test asserts on
 * rendered output and needs them.
 */
import "@testing-library/jest-dom/vitest";
