/**
 * Tests for image compression utility
 *
 * Note: These tests verify the validation logic. Full compression testing
 * requires a browser environment with Canvas API support.
 *
 * ADR-0007 Tier 4: compression against real photos stays manual — see
 * src/lib/utils/TESTING.md. What runs here is the validation logic only.
 *
 * This file was orphaned until the W0-slice: it typechecked because
 * @types/jest was installed, but there was no runner and it could not
 * execute. describe/it/expect are now imported explicitly rather than
 * relying on ambient globals.
 */

import { describe, it, expect } from "vitest";

import {
  validateFileType,
  validateFileSize,
  validateFile,
  formatFileSize,
  ValidationError,
} from "../imageCompression";

describe("formatFileSize", () => {
  it("should format bytes correctly", () => {
    expect(formatFileSize(0)).toBe("0 Bytes");
    expect(formatFileSize(500)).toBe("500 Bytes");
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(1048576)).toBe("1 MB");
    expect(formatFileSize(5242880)).toBe("5 MB");
    expect(formatFileSize(10485760)).toBe("10 MB");
  });
});

describe("validateFileType", () => {
  it("should accept JPEG files", () => {
    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    expect(validateFileType(file)).toBe(true);
  });

  it("should accept PNG files", () => {
    const file = new File([""], "test.png", { type: "image/png" });
    expect(validateFileType(file)).toBe(true);
  });

  it("should reject unsupported MIME types", () => {
    const file = new File([""], "test.gif", { type: "image/gif" });
    expect(() => validateFileType(file)).toThrow(ValidationError);
    expect(() => validateFileType(file)).toThrow("Unsupported file type");
  });

  it("should reject files with wrong extension", () => {
    const file = new File([""], "test.gif", { type: "image/jpeg" });
    expect(() => validateFileType(file)).toThrow(ValidationError);
    expect(() => validateFileType(file)).toThrow("Unsupported file extension");
  });
});

describe("validateFileSize", () => {
  it("should accept files within size limit", () => {
    const file = new File(["x".repeat(1024 * 1024)], "test.jpg", {
      type: "image/jpeg",
    });
    expect(validateFileSize(file, 2)).toBe(true);
  });

  it("should reject files exceeding size limit", () => {
    const file = new File(["x".repeat(6 * 1024 * 1024)], "test.jpg", {
      type: "image/jpeg",
    });
    expect(() => validateFileSize(file, 5)).toThrow(ValidationError);
    expect(() => validateFileSize(file, 5)).toThrow("File is too large");
  });
});

describe("validateFile", () => {
  it("should validate both type and size", () => {
    const file = new File(["x".repeat(1024 * 1024)], "test.jpg", {
      type: "image/jpeg",
    });
    expect(validateFile(file, 10)).toBe(true);
  });

  it("should reject invalid type", () => {
    const file = new File([""], "test.pdf", { type: "application/pdf" });
    expect(() => validateFile(file, 10)).toThrow(ValidationError);
  });

  it("should reject oversized file", () => {
    const file = new File(["x".repeat(11 * 1024 * 1024)], "test.jpg", {
      type: "image/jpeg",
    });
    expect(() => validateFile(file, 10)).toThrow(ValidationError);
  });
});
