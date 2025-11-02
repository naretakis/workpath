// User Profile
export interface UserProfile {
  id: string;              // UUID
  name: string;            // User's name
  state: string;           // State abbreviation (e.g., "CA")
  createdAt: Date;         // When profile was created
}

// Activity
export interface Activity {
  id?: number;             // Auto-increment ID
  date: string;            // YYYY-MM-DD format
  type: 'work' | 'volunteer' | 'education';
  hours: number;           // 0-24
  organization?: string;   // Optional: where they worked
  createdAt: Date;         // When entry was created
  updatedAt: Date;         // When entry was last modified
}

// Monthly Summary (Calculated, not stored)
export interface MonthlySummary {
  month: string;           // YYYY-MM format
  totalHours: number;      // Sum of all hours
  workHours: number;       // Sum of work hours
  volunteerHours: number;  // Sum of volunteer hours
  educationHours: number;  // Sum of education hours
  isCompliant: boolean;    // totalHours >= 80
  hoursNeeded: number;     // 80 - totalHours (if not compliant)
}
