// Run with: node backend/scripts/decrypt-db-value.js "<ENCRYPTED_STRING>"

require("dotenv").config(); // This loads your ENCRYPTION_KEY
const { decrypt } = require("../utils/crypto"); // Adjust path if needed

const encryptedVal = process.argv[2];
if (!encryptedVal) {
  console.log("Usage: node decrypt-db-value.js <encrypted_value>");
  process.exit(1);
}
try {
  const plain = decrypt(encryptedVal);
  console.log("Decrypted:", plain);
} catch (e) {
  console.log("❌ Error decrypting:", e.message);
}
