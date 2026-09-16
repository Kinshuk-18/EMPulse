/**
 * masking.js — EMPulse Data Privacy Utilities
 * =============================================
 * Masking PII so we don't violate privacy laws (and DPDP Act 2023 compliance).
 * All functions take the raw value and return a redacted string safe for the
 * overview table. The modal "View Details" flow bypasses masking intentionally.
 *
 * These helpers never mutate the original data — they only return display strings.
 */

/**
 * Masks a phone number, revealing only the first 4 digits.
 * e.g. "8962345678" → "8962XXXXXX"
 * e.g. "9876543210" → "9876XXXXXX"
 *
 * Handles edge cases: null, undefined, short strings.
 *
 * @param {string} phone - Raw 10-digit mobile number
 * @returns {string} Masked phone string
 */
export function maskPhone(phone) {
  // Gracefully handle missing or non-string values
  if (!phone || typeof phone !== "string") return "XXXXXXXXXX";

  const cleaned = phone.replace(/\D/g, ""); // strip non-digit chars just in case

  // If it's shorter than 4 digits, just mask everything — something is wrong
  if (cleaned.length < 4) return "X".repeat(cleaned.length || 10);

  const visible = cleaned.slice(0, 4);
  const masked = "X".repeat(cleaned.length - 4);
  return `${visible}${masked}`;
}

/**
 * Masks an Aadhaar number using only the last 4 digits.
 * The DB only stores the last 4 digits (aadhaar_last_four), so we
 * display it in the standard XXXX-XXXX-#### masked format.
 *
 * e.g. aadhaar_last_four = "1234" → "XXXX-XXXX-1234"
 * e.g. aadhaar_last_four = "5678" → "XXXX-XXXX-5678"
 *
 * @param {string} lastFour - The last 4 digits of the Aadhaar number
 * @returns {string} Masked Aadhaar display string
 */
export function maskAadhaar(lastFour) {
  // Nothing to mask if the value is missing or invalid
  if (!lastFour || typeof lastFour !== "string") return "XXXX-XXXX-XXXX";

  const cleaned = lastFour.replace(/\D/g, ""); // digits only

  if (cleaned.length !== 4) return `XXXX-XXXX-${cleaned.padStart(4, "X")}`;

  return `XXXX-XXXX-${cleaned}`;
}

/**
 * Masks an APAAR (Academic Bank of Credits) ID.
 * Format similar to Aadhaar but uses 12-digit APAAR IDs.
 * e.g. "123456789012" → "XXXXXX-9012"
 *
 * @param {string} apaar - Full APAAR ID or last segment
 * @returns {string} Masked APAAR display string
 */
export function maskAPAAR(apaar) {
  if (!apaar || typeof apaar !== "string") return "XXXXXX-XXXX";

  const cleaned = apaar.replace(/\D/g, "");
  if (cleaned.length < 4) return `XXXXXX-${cleaned.padStart(4, "X")}`;

  const tail = cleaned.slice(-4);
  return `XXXXXX-${tail}`;
}

/**
 * Masks an email address, showing only the first char + domain.
 * e.g. "priya.sharma@gmail.com" → "p*****@gmail.com"
 * Handy for the nodal officer table if we need to mask those too.
 *
 * @param {string} email
 * @returns {string}
 */
export function maskEmail(email) {
  if (!email || !email.includes("@")) return "****@****.***";

  const [local, domain] = email.split("@");
  const maskedLocal = local[0] + "*".repeat(Math.max(local.length - 1, 3));
  return `${maskedLocal}@${domain}`;
}

/**
 * Returns a safe display label for any sensitive field.
 * Used as a fallback when we don't know the field type.
 *
 * @param {string} value
 * @param {number} visibleChars - how many chars to show at start
 * @returns {string}
 */
export function maskGeneric(value, visibleChars = 2) {
  if (!value || typeof value !== "string") return "****";
  if (value.length <= visibleChars) return "*".repeat(value.length);

  return value.slice(0, visibleChars) + "*".repeat(value.length - visibleChars);
}
