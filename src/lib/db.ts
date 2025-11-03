import Dexie, { Table } from "dexie";
import { UserProfile, Activity } from "@/types";
import { Document, DocumentBlob } from "@/types/documents";

// Database class
class WorkPathDB extends Dexie {
  profiles!: Table<UserProfile>;
  activities!: Table<Activity>;
  documents!: Table<Document>;
  documentBlobs!: Table<DocumentBlob>;

  constructor() {
    super("WorkPathDB");

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
  }
}

// Create database instance
export const db = new WorkPathDB();
