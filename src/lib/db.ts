import Dexie, { Table } from "dexie";
import { UserProfile, Activity } from "@/types";

// Database class
class WorkPathDB extends Dexie {
  profiles!: Table<UserProfile>;
  activities!: Table<Activity>;

  constructor() {
    super("WorkPathDB");

    // Define database schema
    this.version(1).stores({
      profiles: "id",
      activities: "++id, date, type",
    });
  }
}

// Create database instance
export const db = new WorkPathDB();
