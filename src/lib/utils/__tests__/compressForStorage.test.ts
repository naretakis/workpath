/**
 * W0 § 0.4 — the post-compression size check had exactly one home, and that home
 * is dead code.
 *
 * `DocumentMetadataForm.tsx:163-171` was the only place that re-checked a blob's
 * size AFTER compressing it, throwing a useful message if the result was still
 * over 10MB. That file has zero importers and § 0.4 deletes it. The five LIVE
 * compression sites — `ActivityForm.tsx:201, 260, 872` and
 * `IncomeEntryForm.tsx:250, 730` — compress when a blob exceeds 5MB and then hand
 * the result straight to `saveDocument` without looking at it again.
 *
 * What happens without the check: `saveDocument` compares the blob against
 * remaining quota and throws a storage message, or the write simply fails deep in
 * Dexie. Either way the user gets an error about storage rather than one about
 * their photo, and no suggestion of what to do — retake it, use a different
 * camera, pick a smaller file.
 *
 * ## Why a shared helper rather than the check copied five times
 *
 * `codebase-audit-2026-08.md` § 6 lists this codebase's duplication as a defect in
 * its own right, and the five sites are already near-identical copies of the same
 * compress-if-over-5MB block. Pasting the check into each would make six copies of
 * one rule and guarantee they drift. One helper puts the rule in one place, and the
 * five call sites shrink.
 *
 * The thresholds stay as literals HERE and are NOT policy values — 5MB and 10MB
 * are storage limits, not anything CMS publishes, so ADR-0001 does not apply and
 * they must not migrate to the policy profile. Named constants so that is legible.
 */

import { describe, it, expect, vi } from "vitest";

import {
  compressForStorage,
  COMPRESSION_THRESHOLD_BYTES,
  MAX_STORED_BYTES,
  type CompressionOptions,
  type CompressionResult,
} from "@/lib/utils/imageCompression";

/**
 * The compressor seam's signature.
 *
 * Declared explicitly so `mock.calls[0][1]` is typed. `vi.fn(async () => ...)`
 * infers a zero-argument function, so the calls array becomes an empty tuple and
 * indexing it fails typecheck even though the assertion passes at runtime.
 */
type Compressor = (
  file: File,
  options: CompressionOptions,
) => Promise<CompressionResult>;

/** A Blob of an exact byte length, without allocating anything real. */
function blobOfSize(bytes: number, type = "image/jpeg"): Blob {
  const blob = new Blob(["x"], { type });
  Object.defineProperty(blob, "size", { value: bytes, configurable: true });
  return blob;
}

describe("compressForStorage: leaves small blobs alone", () => {
  it("returns a blob under the threshold untouched, and reports no compressedSize", async () => {
    const compress = vi.fn();
    const original = blobOfSize(1024);

    const result = await compressForStorage(original, { compress });

    expect(result.blob).toBe(original);
    expect(result.compressedSize).toBeUndefined();
    expect(compress).not.toHaveBeenCalled();
  });

  it("does not compress at exactly the threshold, matching the existing `>` comparison", async () => {
    // Behaviour preservation: every live site used `blob.size > fiveMB`, so a blob
    // of exactly 5MB was never compressed. Pinned so the helper is a refactor
    // rather than a change.
    const compress = vi.fn();
    const original = blobOfSize(COMPRESSION_THRESHOLD_BYTES);

    const result = await compressForStorage(original, { compress });

    expect(result.blob).toBe(original);
    expect(compress).not.toHaveBeenCalled();
  });
});

describe("compressForStorage: compresses oversized blobs with the established options", () => {
  it("compresses one byte over the threshold", async () => {
    const compressed = blobOfSize(2 * 1024 * 1024);
    const compress = vi.fn(async () => ({
      blob: compressed,
      originalSize: COMPRESSION_THRESHOLD_BYTES + 1,
      compressedSize: compressed.size,
      compressionRatio: 0.4,
    }));

    const result = await compressForStorage(
      blobOfSize(COMPRESSION_THRESHOLD_BYTES + 1),
      { compress },
    );

    expect(compress).toHaveBeenCalledTimes(1);
    expect(result.blob).toBe(compressed);
    expect(result.compressedSize).toBe(compressed.size);
  });

  it("passes through the same options the five call sites used", async () => {
    // quality 0.8, maxDimension 1920, maxSizeMB 5. maxSizeMB is on the audit's
    // dead-type list — "passed by all four call sites, never read" — and is kept
    // here only so this remains a behaviour-preserving refactor. W6a can drop it
    // along with the field.
    const compressed = blobOfSize(1024);
    const compress = vi.fn<Compressor>(async () => ({
      blob: compressed,
      originalSize: 99,
      compressedSize: 1024,
      compressionRatio: 0.1,
    }));

    await compressForStorage(blobOfSize(9 * 1024 * 1024), { compress });

    expect(compress.mock.calls[0][1]).toMatchObject({
      maxSizeMB: 5,
      quality: 0.8,
      maxDimension: 1920,
    });
  });

  it("forwards an onProgress callback when one is given", async () => {
    const compressed = blobOfSize(1024);
    const compress = vi.fn<Compressor>(async () => ({
      blob: compressed,
      originalSize: 99,
      compressedSize: 1024,
      compressionRatio: 0.1,
    }));
    const onProgress = vi.fn();

    await compressForStorage(blobOfSize(9 * 1024 * 1024), {
      compress,
      onProgress,
    });

    expect(compress.mock.calls[0][1]).toMatchObject({ onProgress });
  });
});

describe("compressForStorage: the check this wave exists to preserve", () => {
  it("throws when the blob is STILL too large after compression", async () => {
    // The behaviour rescued from DocumentMetadataForm.tsx:165 before deleting it.
    const stillHuge = blobOfSize(12 * 1024 * 1024);
    const compress = vi.fn(async () => ({
      blob: stillHuge,
      originalSize: 30 * 1024 * 1024,
      compressedSize: stillHuge.size,
      compressionRatio: 0.4,
    }));

    await expect(
      compressForStorage(blobOfSize(30 * 1024 * 1024), { compress }),
    ).rejects.toThrow(/too large/i);
  });

  it("names the actual size and the limit, so the message is actionable", async () => {
    const stillHuge = blobOfSize(12.5 * 1024 * 1024);
    const compress = vi.fn(async () => ({
      blob: stillHuge,
      originalSize: 30 * 1024 * 1024,
      compressedSize: stillHuge.size,
      compressionRatio: 0.4,
    }));

    await expect(
      compressForStorage(blobOfSize(30 * 1024 * 1024), { compress }),
    ).rejects.toThrow(/12\.5MB/);
    await expect(
      compressForStorage(blobOfSize(30 * 1024 * 1024), { compress }),
    ).rejects.toThrow(/10MB/);
  });

  it("suggests what to do next, rather than only reporting a failure", async () => {
    // A dead end is worse than an error. Same principle as every hedge carrying a
    // next action (.kiro/steering/compliance-copy-standards.md); it applies to
    // error messages too, and a photo the user can retake is the cheapest fix
    // available to them.
    const stillHuge = blobOfSize(12 * 1024 * 1024);
    const compress = vi.fn(async () => ({
      blob: stillHuge,
      originalSize: 30 * 1024 * 1024,
      compressedSize: stillHuge.size,
      compressionRatio: 0.4,
    }));

    const error = await compressForStorage(blobOfSize(30 * 1024 * 1024), {
      compress,
    }).catch((e: Error) => e);

    expect((error as Error).message).toMatch(/take a new photo|smaller/i);
  });

  it("accepts a compressed blob exactly at the maximum", async () => {
    const atLimit = blobOfSize(MAX_STORED_BYTES);
    const compress = vi.fn(async () => ({
      blob: atLimit,
      originalSize: 30 * 1024 * 1024,
      compressedSize: atLimit.size,
      compressionRatio: 0.3,
    }));

    const result = await compressForStorage(blobOfSize(30 * 1024 * 1024), {
      compress,
    });

    expect(result.blob).toBe(atLimit);
  });

  it("propagates a compression failure rather than storing the original oversized blob", async () => {
    const compress = vi.fn(async () => {
      throw new Error("canvas unavailable");
    });

    await expect(
      compressForStorage(blobOfSize(30 * 1024 * 1024), { compress }),
    ).rejects.toThrow(/canvas unavailable/);
  });
});

describe("the thresholds are storage limits, not policy values", () => {
  it("exports them as named constants at their established sizes", () => {
    // ADR-0001 governs POLICY values — 80 hours, $580, lookback lengths. These are
    // device storage limits with no CFR source, so they belong here and must not be
    // moved into src/lib/policy/. Asserted so the distinction is recorded rather
    // than assumed.
    expect(COMPRESSION_THRESHOLD_BYTES).toBe(5 * 1024 * 1024);
    expect(MAX_STORED_BYTES).toBe(10 * 1024 * 1024);
  });
});
