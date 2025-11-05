import { db } from "@/lib/db";
import { UserProfile } from "@/types";
import { encryptString, decryptString } from "@/lib/utils/encryption";

/**
 * Save a new profile to the database
 */
export async function saveProfile(profile: UserProfile): Promise<void> {
  try {
    // Encrypt sensitive fields before saving
    const encryptedProfile = { ...profile };

    if (profile.dateOfBirth) {
      encryptedProfile.dateOfBirth = await encryptString(profile.dateOfBirth);
    }

    if (profile.medicaidId) {
      encryptedProfile.medicaidId = await encryptString(profile.medicaidId);
    }

    await db.profiles.add(encryptedProfile);
  } catch (error) {
    console.error("Error saving profile:", error);
    throw new Error("Failed to save profile");
  }
}

/**
 * Get a profile by ID and decrypt sensitive fields
 */
export async function getProfile(id: string): Promise<UserProfile | undefined> {
  try {
    const profile = await db.profiles.get(id);

    if (!profile) {
      return undefined;
    }

    // Decrypt sensitive fields
    const decryptedProfile = { ...profile };

    if (profile.dateOfBirth) {
      try {
        decryptedProfile.dateOfBirth = await decryptString(profile.dateOfBirth);
      } catch (error) {
        console.error("Error decrypting date of birth:", error);
        // Keep encrypted value if decryption fails
      }
    }

    if (profile.medicaidId) {
      try {
        decryptedProfile.medicaidId = await decryptString(profile.medicaidId);
      } catch (error) {
        console.error("Error decrypting Medicaid ID:", error);
        // Keep encrypted value if decryption fails
      }
    }

    return decryptedProfile;
  } catch (error) {
    console.error("Error getting profile:", error);
    throw new Error("Failed to get profile");
  }
}

/**
 * Update an existing profile
 */
export async function updateProfile(
  id: string,
  updates: Partial<UserProfile>,
): Promise<void> {
  try {
    // Encrypt sensitive fields if they're being updated
    const encryptedUpdates = { ...updates };

    if (updates.dateOfBirth) {
      encryptedUpdates.dateOfBirth = await encryptString(updates.dateOfBirth);
    }

    if (updates.medicaidId) {
      encryptedUpdates.medicaidId = await encryptString(updates.medicaidId);
    }

    // Always update the updatedAt timestamp
    encryptedUpdates.updatedAt = new Date();

    await db.profiles.update(id, encryptedUpdates);
  } catch (error) {
    console.error("Error updating profile:", error);
    throw new Error("Failed to update profile");
  }
}

/**
 * Get the first profile (for single-user app)
 */
export async function getFirstProfile(): Promise<UserProfile | undefined> {
  try {
    const profiles = await db.profiles.toArray();

    if (profiles.length === 0) {
      return undefined;
    }

    return getProfile(profiles[0].id);
  } catch (error) {
    console.error("Error getting first profile:", error);
    throw new Error("Failed to get profile");
  }
}

/**
 * Check if a profile exists
 */
export async function profileExists(): Promise<boolean> {
  try {
    const count = await db.profiles.count();
    return count > 0;
  } catch (error) {
    console.error("Error checking profile existence:", error);
    return false;
  }
}
