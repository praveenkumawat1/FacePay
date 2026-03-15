/**
 * Utility functions for referral code generation and validation.
 * @module utils/referral
 */

/**
 * Generates a random alphanumeric string of given length.
 * @param {number} length - Length of the code (default 8)
 * @returns {string} Random code (uppercase letters + numbers)
 */
function generateRandomCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generates a unique referral code with an optional prefix.
 * @param {string} prefix - Prefix to add (default 'FP')
 * @param {number} randomLength - Length of the random part (default 6)
 * @returns {string} Referral code like 'FP' + random chars
 */
function generateReferralCode(prefix = "FP", randomLength = 6) {
  return prefix + generateRandomCode(randomLength);
}

/**
 * Checks if a given referral code matches the expected format.
 * @param {string} code - The referral code to validate
 * @param {string} prefix - Expected prefix (default 'FP')
 * @returns {boolean} True if valid format
 */
function isValidReferralCode(code, prefix = "FP") {
  if (!code || typeof code !== "string") return false;
  const regex = new RegExp(`^${prefix}[A-Z0-9]{6,}$`);
  return regex.test(code);
}

module.exports = {
  generateRandomCode,
  generateReferralCode,
  isValidReferralCode,
};
