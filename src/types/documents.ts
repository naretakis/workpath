// Document Types

export type DocumentType =
  | "pay-stub"
  | "volunteer-verification"
  | "school-enrollment"
  | "medical-documentation"
  | "other";

// Document Metadata
export interface Document {
  id?: number; // Auto-increment ID
  activityId: number; // Foreign key to activities table
  type: DocumentType; // Type of document
  customType?: string; // If type is "other"
  description?: string; // Optional description (max 200 chars)
  originalFileName?: string; // Original file name
  fileSize: number; // Size in bytes
  compressedSize?: number; // Size after compression (if compressed)
  mimeType: string; // image/jpeg or image/png
  captureMethod: "camera" | "upload"; // How document was added
  createdAt: Date; // When document was created
  blobId: number; // Foreign key to documentBlobs table
}

// Document Blob
export interface DocumentBlob {
  id?: number; // Auto-increment ID
  blob: Blob; // The actual image data
  createdAt: Date; // When blob was stored
}
