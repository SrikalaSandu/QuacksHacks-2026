// src/lib/validation.js

/**
 * Validates a phone number in E.164 format
 * Format: +[country code][number]
 * Example: +1234567890
 * 
 * Rules:
 * - Must start with +
 * - Followed by 1-3 digit country code
 * - Followed by up to 15 digits total
 * - No spaces, dashes, or other characters
 * 
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if valid E.164 format
 */
export const validateE164 = (phone) => {
  // E.164 format: + followed by 1-15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
};

/**
 * Formats a phone number for display (if needed)
 * @param {string} phone - E.164 formatted phone
 * @returns {string} - Formatted for display
 */
export const formatPhoneDisplay = (phone) => {
  if (!phone || !validateE164(phone)) return phone;
  
  // Simple formatting for US numbers (+1XXXXXXXXXX)
  if (phone.startsWith('+1') && phone.length === 12) {
    return `+1 (${phone.slice(2, 5)}) ${phone.slice(5, 8)}-${phone.slice(8)}`;
  }
  
  return phone;
};
