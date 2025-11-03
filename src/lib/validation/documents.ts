import { z } from "zod";

// Document Type enum schema
export const documentTypeSchema = z.enum([
  "pay-stub",
  "volunteer-verification",
  "school-enrollment",
  "medical-documentation",
  "other",
]);

// Document metadata validation schema
export const documentMetadataSchema = z.object({
  type: documentTypeSchema,
  customType: z
    .string()
    .max(100, "Custom type must be 100 characters or less")
    .optional(),
  description: z
    .string()
    .max(200, "Description must be 200 characters or less")
    .optional(),
  originalFileName: z.string().optional(),
  fileSize: z.number().positive("File size must be positive"),
  compressedSize: z.number().positive().optional(),
  mimeType: z.enum(["image/jpeg", "image/png"], {
    message: "Only JPEG and PNG images are supported",
  }),
  captureMethod: z.enum(["camera", "upload"]),
});

// File validation schema
export const fileValidationSchema = z.object({
  file: z.instanceof(File),
  maxSizeMB: z.number().positive().default(10),
});

// Validate file type
export function validateFileType(file: File): boolean {
  const validTypes = ["image/jpeg", "image/png"];
  return validTypes.includes(file.type);
}

// Validate file size
export function validateFileSize(file: File, maxMB: number = 10): boolean {
  const maxBytes = maxMB * 1024 * 1024;
  return file.size <= maxBytes;
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// Validation error messages
export const validationErrors = {
  invalidFileType: "Only JPEG and PNG images are supported",
  fileTooLarge: (maxMB: number) =>
    `File size must be less than ${maxMB}MB. Please try compressing the image or taking a new photo.`,
  descriptionTooLong: "Description must be 200 characters or less",
  customTypeTooLong: "Custom type must be 100 characters or less",
  invalidFileSize: "File size must be a positive number",
};
