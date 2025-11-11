/**
 * Income Tracking Types
 *
 * TypeScript interfaces for income tracking feature.
 * Supports income-based compliance as alternative to hours tracking.
 */

// Income Entry
export interface IncomeEntry {
  id?: number; // Auto-increment ID
  userId: string; // Link to user profile
  date: string; // YYYY-MM-DD format
  amount: number; // Dollar amount (e.g., 150.50)
  payPeriod: "daily" | "weekly" | "bi-weekly" | "monthly";
  monthlyEquivalent: number; // Calculated based on pay period
  source?: string; // Optional: employer/source name
  isSeasonalWorker: boolean; // Whether this entry is marked as seasonal
  incomeType?: "wages" | "self-employment" | "gig-work" | "tips" | "other"; // Type of earned income
  createdAt: Date;
  updatedAt: Date;
}

// Income Document (similar to Activity Document)
export interface IncomeDocument {
  id?: number;
  incomeEntryId: number; // Link to income entry
  blobId: number; // Link to blob storage
  type: "pay_stub" | "bank_statement" | "app_screenshot" | "other";
  customType?: string; // If type is "other"
  description?: string;
  fileSize: number; // Original file size in bytes
  compressedSize?: number; // Compressed size if compression was applied
  mimeType: "image/jpeg" | "image/png";
  captureMethod: "camera" | "upload";
  createdAt: Date;
}

// Income Document Blob (similar to Activity Document Blob)
export interface IncomeDocumentBlob {
  id?: number;
  blob: Blob;
  createdAt: Date;
}

// Compliance Mode (track user's choice per month)
export interface ComplianceMode {
  id?: number;
  userId: string;
  month: string; // YYYY-MM format
  mode: "hours" | "income";
  createdAt: Date;
  updatedAt: Date;
}

// Monthly Income Summary (calculated, not stored)
export interface MonthlyIncomeSummary {
  month: string; // YYYY-MM format
  totalIncome: number; // Sum of all monthly equivalents
  entryCount: number; // Number of income entries
  isCompliant: boolean; // totalIncome >= INCOME_THRESHOLD
  amountNeeded: number; // INCOME_THRESHOLD - totalIncome (if not compliant)
  isSeasonalWorker: boolean; // If any entry is marked seasonal
  seasonalAverage?: number; // 6-month average if seasonal
  seasonalHistory?: Array<{ month: string; total: number }>; // 6 months of data
  incomeBySource?: Array<{ source: string; monthlyEquivalent: number }>; // Breakdown by source
}
