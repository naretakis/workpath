/**
 * Income Document Storage Functions
 *
 * Handles storage and retrieval of income entry documents.
 * Follows the same pattern as activity documents.
 */

import { db } from "@/lib/db";
import { IncomeDocument, IncomeDocumentBlob } from "@/types/income";

/**
 * Save a document with its blob to the database
 * @param incomeEntryId - ID of the income entry to link the document to
 * @param blob - The image blob to store
 * @param metadata - Document metadata (without id, blobId, createdAt, incomeEntryId)
 * @returns The ID of the saved document
 */
export async function saveIncomeDocument(
  incomeEntryId: number,
  blob: Blob,
  metadata: Omit<
    IncomeDocument,
    "id" | "blobId" | "createdAt" | "incomeEntryId"
  >,
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

    // Store blob first
    const blobId = await db.incomeDocumentBlobs.add({
      blob,
      createdAt: new Date(),
    });

    // Store document metadata
    const documentId = await db.incomeDocuments.add({
      ...metadata,
      incomeEntryId,
      blobId,
      createdAt: new Date(),
    });

    return documentId;
  } catch (error) {
    console.error("Error saving income document:", error);
    throw error;
  }
}

/**
 * Get all documents for a specific income entry
 * @param incomeEntryId - ID of the income entry
 * @returns Array of documents
 */
export async function getDocumentsByIncomeEntry(
  incomeEntryId: number,
): Promise<IncomeDocument[]> {
  try {
    const documents = await db.incomeDocuments
      .where("incomeEntryId")
      .equals(incomeEntryId)
      .toArray();
    return documents;
  } catch (error) {
    console.error("Error getting documents by income entry:", error);
    throw error;
  }
}

/**
 * Get a single income document by ID
 * @param documentId - ID of the document
 * @returns The document or undefined if not found
 */
export async function getIncomeDocument(
  documentId: number,
): Promise<IncomeDocument | undefined> {
  try {
    const document = await db.incomeDocuments.get(documentId);
    return document;
  } catch (error) {
    console.error("Error getting income document:", error);
    throw error;
  }
}

/**
 * Delete an income document and its associated blob
 * @param documentId - ID of the document to delete
 */
export async function deleteIncomeDocument(documentId: number): Promise<void> {
  try {
    // Get the document to find the blobId
    const document = await db.incomeDocuments.get(documentId);

    if (!document) {
      throw new Error("Income document not found");
    }

    // Delete the blob
    await db.incomeDocumentBlobs.delete(document.blobId);

    // Delete the document metadata
    await db.incomeDocuments.delete(documentId);
  } catch (error) {
    console.error("Error deleting income document:", error);
    throw error;
  }
}

/**
 * Get an income document blob by blob ID
 * @param blobId - ID of the blob
 * @returns The document blob or undefined if not found
 */
export async function getIncomeDocumentBlob(
  blobId: number,
): Promise<IncomeDocumentBlob | undefined> {
  try {
    const documentBlob = await db.incomeDocumentBlobs.get(blobId);
    return documentBlob;
  } catch (error) {
    console.error("Error getting income document blob:", error);
    throw error;
  }
}
