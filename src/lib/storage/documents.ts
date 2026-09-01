import { db } from "@/lib/db";
import { Document, DocumentBlob } from "@/types/documents";

/**
 * Save a document with its blob to the database
 * @param activityId - ID of the activity to link the document to
 * @param blob - The image blob to store
 * @param metadata - Document metadata (without id, blobId, createdAt)
 * @returns The ID of the saved document
 */
export async function saveDocument(
  activityId: number,
  blob: Blob,
  metadata: Omit<Document, "id" | "blobId" | "createdAt" | "activityId">,
): Promise<number> {
  try {
    // Check storage quota
    const quota = await navigator.storage.estimate();
    const available = (quota.quota || 0) - (quota.usage || 0);
    const availableMB = Math.floor(available / (1024 * 1024));

    if (available < 50 * 1024 * 1024) {
      // Less than 50MB available
      throw new Error(
        `Insufficient storage space. Only ${availableMB}MB available. Please delete some old documents to free up space.`,
      );
    }

    // Check if the blob itself would fit
    if (blob.size > available) {
      throw new Error(
        `Document is too large for available storage (${availableMB}MB available). Please delete some old documents first.`,
      );
    }

    // Both writes in ONE transaction. W0 § 0.6.
    //
    // These used to be two independent awaits, blob first. If the metadata write
    // failed the blob stayed behind with nothing pointing at it — invisible to the
    // UI, uncounted by StorageInfo, and unreachable by every delete path, since all
    // of them start from the metadata row to find the blobId. Blobs are the largest
    // rows in the database and orphans accumulate on each retry.
    //
    // cleanupOrphanedDocuments cannot reclaim these: it scans db.documents against
    // db.activities, so it finds documents whose activity is gone, not blobs whose
    // document never existed.
    const documentId = await db.transaction(
      "rw",
      db.documentBlobs,
      db.documents,
      async () => {
        const blobId = await db.documentBlobs.add({
          blob,
          createdAt: new Date(),
        });

        return await db.documents.add({
          ...metadata,
          activityId,
          blobId,
          createdAt: new Date(),
        });
      },
    );

    return documentId;
  } catch (error) {
    console.error("Error saving document:", error);
    throw error;
  }
}

/**
 * Get all documents for a specific activity
 * @param activityId - ID of the activity
 * @returns Array of documents
 */
export async function getDocumentsByActivity(
  activityId: number,
): Promise<Document[]> {
  try {
    const documents = await db.documents
      .where("activityId")
      .equals(activityId)
      .toArray();
    return documents;
  } catch (error) {
    console.error("Error getting documents by activity:", error);
    throw error;
  }
}

/**
 * Get a single document by ID
 * @param documentId - ID of the document
 * @returns The document or undefined if not found
 */
export async function getDocument(
  documentId: number,
): Promise<Document | undefined> {
  try {
    const document = await db.documents.get(documentId);
    return document;
  } catch (error) {
    console.error("Error getting document:", error);
    throw error;
  }
}

/**
 * Delete a document and its associated blob
 * @param documentId - ID of the document to delete
 */
export async function deleteDocument(documentId: number): Promise<void> {
  try {
    // Get the document to find the blobId
    const document = await db.documents.get(documentId);

    if (!document) {
      throw new Error("Document not found");
    }

    // Delete the blob
    await db.documentBlobs.delete(document.blobId);

    // Delete the document metadata
    await db.documents.delete(documentId);
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
}

/**
 * Get a document blob by blob ID
 * @param blobId - ID of the blob
 * @returns The document blob or undefined if not found
 */
export async function getDocumentBlob(
  blobId: number,
): Promise<DocumentBlob | undefined> {
  try {
    const documentBlob = await db.documentBlobs.get(blobId);
    return documentBlob;
  } catch (error) {
    console.error("Error getting document blob:", error);
    throw error;
  }
}
