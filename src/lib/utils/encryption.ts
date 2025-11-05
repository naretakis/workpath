/**
 * Encryption utilities for sensitive profile data
 * Uses Web Crypto API for AES-GCM encryption
 * Note: This is basic encryption for local storage protection
 * Not meant for transmission or high-security scenarios
 */

import { db } from "@/lib/db";

const ENCRYPTION_KEY_NAME = "hourkeep-encryption-key";

/**
 * Get or generate encryption key
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  try {
    // Try to get existing key from IndexedDB
    const keyData = await getStoredKey();

    if (keyData) {
      // Import stored key
      return crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"],
      );
    }

    // Generate new key
    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );

    // Store key for future use
    const exportedKey = await crypto.subtle.exportKey("raw", key);
    await storeKey(exportedKey);

    return key;
  } catch (error) {
    console.error("Error getting encryption key:", error);
    throw new Error("Failed to get encryption key");
  }
}

/**
 * Get stored encryption key from IndexedDB
 */
async function getStoredKey(): Promise<ArrayBuffer | null> {
  try {
    // Use a simple key-value store in IndexedDB
    const result = await db.transaction("r", db.profiles, async () => {
      // Check if we have a key stored in localStorage as fallback
      const storedKey = localStorage.getItem(ENCRYPTION_KEY_NAME);
      if (storedKey) {
        // Convert base64 to ArrayBuffer
        const binaryString = atob(storedKey);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      }
      return null;
    });

    return result;
  } catch (error) {
    console.error("Error getting stored key:", error);
    return null;
  }
}

/**
 * Store encryption key in IndexedDB
 */
async function storeKey(keyData: ArrayBuffer): Promise<void> {
  try {
    // Store in localStorage as a simple key-value store
    const bytes = new Uint8Array(keyData);
    const binaryString = String.fromCharCode(...bytes);
    const base64Key = btoa(binaryString);
    localStorage.setItem(ENCRYPTION_KEY_NAME, base64Key);
  } catch (error) {
    console.error("Error storing key:", error);
    throw new Error("Failed to store encryption key");
  }
}

/**
 * Encrypt a string
 */
export async function encryptString(plaintext: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(plaintext),
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("Error encrypting string:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt a string
 */
export async function decryptString(ciphertext: string): Promise<string> {
  try {
    const key = await getEncryptionKey();

    // Convert from base64
    const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encrypted,
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Error decrypting string:", error);
    throw new Error("Failed to decrypt data");
  }
}
