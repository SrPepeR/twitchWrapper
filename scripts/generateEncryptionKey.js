/**
 * Script to generate a secure encryption key for token storage
 * Run this script and copy the generated key to your .env file
 */

const crypto = require("crypto");

// Generate a 32-byte (256-bit) key for AES-256
const encryptionKey = crypto.randomBytes(32).toString("hex");

console.log("🔐 Generated encryption key:");
console.log("==================================");
console.log(encryptionKey);
console.log("==================================");
console.log("\n📝 Copy this key to your .env file:");
console.log(`ENCRYPTION_KEY=${encryptionKey}`);
console.log("\n⚠️  IMPORTANT: Keep this key secure and do not share it.");
console.log(
  "   If you lose this key, you will not be able to decrypt stored tokens."
);
