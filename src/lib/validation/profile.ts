import { z } from "zod";

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Format phone number to (XXX) XXX-XXXX
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Handle different lengths
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === "1") {
    // Handle +1 prefix
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  // Return original if can't format
  return phone;
}

/**
 * Validate US phone number
 */
export function validatePhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Must be 10 digits or 11 digits starting with 1
  return digits.length === 10 || (digits.length === 11 && digits[0] === "1");
}

/**
 * Profile validation schema
 */
export const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),

  state: z
    .string()
    .length(2, "Please select a state")
    .regex(/^[A-Z]{2}$/, "Invalid state code"),

  dateOfBirth: z
    .date({
      message: "Please enter a valid date",
    })
    .refine(
      (date) => {
        const age = calculateAge(date);
        return age >= 16 && age <= 120;
      },
      {
        message: "Please enter a valid date of birth (age must be 16-120)",
      },
    ),

  medicaidId: z
    .string()
    .max(50, "Medicaid ID must be less than 50 characters")
    .optional()
    .or(z.literal("")),

  phoneNumber: z
    .string()
    .refine(
      (phone) => {
        if (!phone || phone === "") return true;
        return validatePhoneNumber(phone);
      },
      {
        message:
          "Please enter a valid US phone number (e.g., (555) 123-4567 or 555-123-4567)",
      },
    )
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
});

/**
 * Type for profile form data
 */
export type ProfileFormData = z.infer<typeof profileSchema>;
