/**
 * Document access dispatch — which table a document id belongs to.
 *
 * Added by W0 § 0.3.1 to fix a data-loss bug: `DocumentViewer` imported
 * `getDocument` / `getDocumentBlob` / `deleteDocument` from
 * `@/lib/storage/documents` unconditionally, while `IncomeEntryForm` fed it ids
 * from `db.incomeDocuments`. `db.documents` and `db.incomeDocuments` are separate
 * object stores with independent `++id` sequences (`db.ts` v6), so the ids
 * collide, and the viewer's Delete destroyed an unrelated activity document while
 * the income document survived.
 *
 * The two storage modules are already structurally parallel. This module supplies
 * the missing discriminator so a caller must state which table it means, and so
 * the choice can be tested without rendering a dialog — the render path calls
 * `URL.createObjectURL`, which jsdom does not implement.
 *
 * Deliberately NOT a `Record<DocumentContext, DocumentAccessor>` constant: the
 * accessors are built on demand so that adding a context to the union produces a
 * TypeScript error at the switch rather than a silently missing key.
 */

import {
  getDocument,
  getDocumentBlob,
  deleteDocument,
} from "@/lib/storage/documents";
import {
  getIncomeDocument,
  getIncomeDocumentBlob,
  deleteIncomeDocument,
} from "@/lib/storage/incomeDocuments";

/**
 * Which document table an id refers to.
 *
 * `activity` -> `db.documents` + `db.documentBlobs`
 * `income`   -> `db.incomeDocuments` + `db.incomeDocumentBlobs`
 */
export const DOCUMENT_CONTEXTS = ["activity", "income"] as const;

export type DocumentContext = (typeof DOCUMENT_CONTEXTS)[number];

/**
 * The fields `DocumentViewer` actually reads, common to `Document` and
 * `IncomeDocument`.
 *
 * A structural type rather than a union, so the viewer needs no narrowing. The
 * two concrete types differ in their foreign key (`activityId` vs
 * `incomeEntryId`) and in the members of their `type` union — neither of which
 * the viewer touches beyond displaying `type` as a label.
 */
export interface ViewableDocument {
  id?: number;
  blobId: number;
  type: string;
  customType?: string;
  description?: string;
  fileSize: number;
  compressedSize?: number;
  captureMethod: "camera" | "upload";
  createdAt: Date;
}

export interface ViewableDocumentBlob {
  blob: Blob;
}

export interface DocumentAccessor {
  /** Metadata for a document id within this context, or undefined if absent. */
  getMetadata(documentId: number): Promise<ViewableDocument | undefined>;
  /** The stored blob for a blob id within this context. */
  getBlob(blobId: number): Promise<ViewableDocumentBlob | undefined>;
  /** Delete the document and its blob. Throws if the document is absent. */
  remove(documentId: number): Promise<void>;
}

/**
 * Resolve the storage functions for a document context.
 *
 * @param context - Which document table the id belongs to. Required by design:
 *   an optional discriminator that defaults to one table is precisely the bug
 *   this module exists to fix.
 * @throws If given a context outside the union — reachable only from untyped
 *   callers, but a thrown error is preferable to silently reading the wrong table.
 */
export function getDocumentAccessor(
  context: DocumentContext,
): DocumentAccessor {
  switch (context) {
    case "activity":
      return {
        getMetadata: getDocument,
        getBlob: getDocumentBlob,
        remove: deleteDocument,
      };
    case "income":
      return {
        getMetadata: getIncomeDocument,
        getBlob: getIncomeDocumentBlob,
        remove: deleteIncomeDocument,
      };
    default: {
      // Exhaustiveness check: adding a member to DOCUMENT_CONTEXTS without a case
      // above fails to compile here rather than falling through at runtime.
      const unreachable: never = context;
      throw new Error(`Unknown document context: ${String(unreachable)}`);
    }
  }
}
