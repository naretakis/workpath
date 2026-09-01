/**
 * Image Compression Utility
 *
 * Provides functions for compressing images to reduce file size while maintaining
 * acceptable quality for document verification purposes.
 */

export interface CompressionOptions {
  maxSizeMB?: number;
  quality?: number;
  maxDimension?: number;
  onProgress?: (progress: number) => void;
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Load an image file and return an HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));

      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress an image file to reduce its size
 *
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise resolving to compression result with the compressed blob
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {},
): Promise<CompressionResult> {
  const { quality = 0.8, maxDimension = 1920, onProgress } = options;

  const originalSize = file.size;

  // Report initial progress
  onProgress?.(0);

  // Load the image
  const img = await loadImage(file);
  onProgress?.(25);

  // Calculate new dimensions while maintaining aspect ratio
  let { width, height } = img;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height / width) * maxDimension);
      width = maxDimension;
    } else {
      width = Math.round((width / height) * maxDimension);
      height = maxDimension;
    }
  }

  onProgress?.(50);

  // Create canvas and draw resized image
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Draw image on canvas
  ctx.drawImage(img, 0, 0, width, height);
  onProgress?.(75);

  // Convert canvas to blob with compression
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("Failed to compress image"));
        }
      },
      "image/jpeg",
      quality,
    );
  });

  onProgress?.(100);

  const compressedSize = blob.size;
  const compressionRatio = originalSize > 0 ? compressedSize / originalSize : 1;

  return {
    blob,
    originalSize,
    compressedSize,
    compressionRatio,
  };
}

/**
 * Validation error types
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Allowed image MIME types
 */
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];

/**
 * Allowed file extensions
 */
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"];

/**
 * Validate that a file is a supported image type (JPEG or PNG)
 *
 * @param file - The file to validate
 * @returns true if valid
 * @throws ValidationError if file type is not supported
 */
export function validateFileType(file: File): boolean {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new ValidationError(
      `Unsupported file type: ${file.type}. Only JPEG and PNG images are supported.`,
    );
  }

  // Check file extension as additional validation
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext),
  );

  if (!hasValidExtension) {
    throw new ValidationError(
      `Unsupported file extension. Only .jpg, .jpeg, and .png files are supported.`,
    );
  }

  return true;
}

/**
 * Validate that a file size is within the allowed limit
 *
 * @param file - The file to validate
 * @param maxMB - Maximum file size in megabytes
 * @returns true if valid
 * @throws ValidationError if file is too large
 */
export function validateFileSize(file: File, maxMB: number): boolean {
  const maxBytes = maxMB * 1024 * 1024;

  if (file.size > maxBytes) {
    throw new ValidationError(
      `File is too large (${formatFileSize(file.size)}). Maximum size is ${maxMB}MB.`,
    );
  }

  return true;
}

/**
 * Format a file size in bytes to a human-readable string
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB", "500 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validate a file for both type and size
 *
 * @param file - The file to validate
 * @param maxMB - Maximum file size in megabytes (default: 10)
 * @returns true if valid
 * @throws ValidationError if validation fails
 */
export function validateFile(file: File, maxMB: number = 10): boolean {
  validateFileType(file);
  validateFileSize(file, maxMB);
  return true;
}

/**
 * Compress a blob above this size before storing it.
 *
 * NOT a policy value. ADR-0001 governs values CMS publishes — 80 hours, $580,
 * lookback lengths — and requires them to live in `src/lib/policy/`. These two are
 * device storage limits with no CFR source, so they belong here.
 */
export const COMPRESSION_THRESHOLD_BYTES = 5 * 1024 * 1024;

/** Refuse to store a blob larger than this, even after compression. */
export const MAX_STORED_BYTES = 10 * 1024 * 1024;

export interface CompressForStorageOptions {
  /** Progress callback, forwarded to the compressor. */
  onProgress?: (progress: number) => void;
  /**
   * Compressor override, for tests. Real compression needs the Canvas API, which
   * jsdom does not implement, so the size-checking logic could not otherwise be
   * tested at all. Production callers omit this.
   */
  compress?: (
    file: File,
    options: CompressionOptions,
  ) => Promise<CompressionResult>;
}

export interface CompressForStorageResult {
  /** The blob to store — the original, or the compressed version. */
  blob: Blob;
  /** Size after compression, or undefined if no compression was needed. */
  compressedSize?: number;
}

/**
 * Compress a blob if it is too large to store, and refuse it if compression was
 * not enough.
 *
 * Added by W0 § 0.4 to preserve behaviour that was about to be deleted.
 * `DocumentMetadataForm.tsx:163-171` was the ONLY place that re-checked size after
 * compressing, and that component has zero importers and is removed in this wave.
 * The five live sites — `ActivityForm.tsx` (3) and `IncomeEntryForm.tsx` (2) —
 * compressed and then handed the result straight to `saveDocument` without looking
 * at it, so an image that was still too big surfaced as a storage-quota error
 * instead of an actionable message about the photo.
 *
 * A single helper rather than the check copied into five places:
 * `codebase-audit-2026-08.md` § 6 records this codebase's duplication as a defect
 * in its own right, and the five blocks were already near-identical.
 *
 * Behaviour is preserved exactly, including the strict `>` comparison — a blob of
 * precisely 5MB is not compressed, as before — and the `maxSizeMB: 5` option, which
 * the audit notes is passed by every call site and never read. It stays so this is
 * a refactor rather than a change; W6a can drop it with the field.
 *
 * @throws If the blob is still larger than {@link MAX_STORED_BYTES} after
 *   compression, with a message naming the size, the limit, and what to try.
 */
export async function compressForStorage(
  blob: Blob,
  options: CompressForStorageOptions = {},
): Promise<CompressForStorageResult> {
  const { onProgress, compress = compressImage } = options;

  if (blob.size <= COMPRESSION_THRESHOLD_BYTES) {
    return { blob };
  }

  const result = await compress(blob as File, {
    maxSizeMB: 5,
    quality: 0.8,
    maxDimension: 1920,
    ...(onProgress ? { onProgress } : {}),
  });

  if (result.blob.size > MAX_STORED_BYTES) {
    const sizeMB = (result.blob.size / (1024 * 1024)).toFixed(1);
    const limitMB = Math.round(MAX_STORED_BYTES / (1024 * 1024));
    throw new Error(
      `This image is too large to save (${sizeMB}MB even after shrinking it). The most we can store is ${limitMB}MB.\n\nTry one of these:\n• Take a new photo in better light\n• Use a different camera or app\n• Pick a smaller image`,
    );
  }

  return { blob: result.blob, compressedSize: result.compressedSize };
}
