import Dexie, { Table } from "dexie";
import { UserProfile, Activity } from "@/types";
import { Document, DocumentBlob } from "@/types/documents";
import { ExemptionScreening, ExemptionHistory } from "@/types/exemptions";
import {
  IncomeEntry,
  IncomeDocument,
  IncomeDocumentBlob,
  ComplianceMode,
  SeasonalWorkerStatus,
} from "@/types/income";

// Database class
class HourKeepDB extends Dexie {
  profiles!: Table<UserProfile>;
  activities!: Table<Activity>;
  documents!: Table<Document>;
  documentBlobs!: Table<DocumentBlob>;
  exemptions!: Table<ExemptionScreening>;
  exemptionHistory!: Table<ExemptionHistory>;
  incomeEntries!: Table<IncomeEntry>;
  incomeDocuments!: Table<IncomeDocument>;
  incomeDocumentBlobs!: Table<IncomeDocumentBlob>;
  complianceModes!: Table<ComplianceMode>;
  seasonalWorkerStatus!: Table<SeasonalWorkerStatus>;

  constructor() {
    super("HourKeepDB");

    // Version 1: Initial schema
    this.version(1).stores({
      profiles: "id",
      activities: "++id, date, type",
    });

    // Version 2: Add document tables
    this.version(2)
      .stores({
        profiles: "id",
        activities: "++id, date, type",
        documents: "++id, activityId, type, createdAt",
        documentBlobs: "++id",
      })
      .upgrade(() => {
        // No data migration needed for new tables
        console.log("Added document tables to database");
      });

    // Version 3: Add exemption tables
    this.version(3)
      .stores({
        profiles: "id",
        activities: "++id, date, type",
        documents: "++id, activityId, type, createdAt",
        documentBlobs: "++id",
        exemptions: "++id, userId, screeningDate",
        exemptionHistory: "++id, userId, screeningDate",
      })
      .upgrade(() => {
        // No data migration needed for new tables
        console.log("Added exemption tables to database");
      });

    // Version 4: Update profile schema with new fields
    this.version(4)
      .stores({
        profiles: "id",
        activities: "++id, date, type",
        documents: "++id, activityId, type, createdAt",
        documentBlobs: "++id",
        exemptions: "++id, userId, screeningDate",
        exemptionHistory: "++id, userId, screeningDate",
      })
      .upgrade(async (tx) => {
        // Migrate existing profiles
        const profiles = await tx.table("profiles").toArray();

        for (const profile of profiles) {
          // Add new fields with defaults
          await tx.table("profiles").update(profile.id, {
            dateOfBirth: "", // Empty, will prompt user to complete
            privacyNoticeAcknowledged: false,
            privacyNoticeAcknowledgedAt: new Date(),
            version: 2,
            updatedAt: new Date(),
          });
        }

        console.log("Migrated profiles to version 2 schema");
      });

    // Version 5: Add income tracking tables
    this.version(5)
      .stores({
        profiles: "id",
        activities: "++id, date, type",
        documents: "++id, activityId, type, createdAt",
        documentBlobs: "++id",
        exemptions: "++id, userId, screeningDate",
        exemptionHistory: "++id, userId, screeningDate",
        incomeEntries: "++id, date, userId",
        incomeDocuments: "++id, incomeEntryId, type, createdAt",
        incomeDocumentBlobs: "++id",
        complianceModes: "++id, month, userId",
        seasonalWorkerStatus: "++id, userId, month",
      })
      .upgrade(() => {
        console.log("Added income tracking tables to database");
      });
  }
}

// Create database instance
export const db = new HourKeepDB();
