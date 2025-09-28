const fs = require("fs").promises;
const crypto = require("crypto");
const path = require("path");

// File to store encrypted tokens
const TOKEN_FILE = path.join(__dirname, "..", ".tokens");
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "your-32-char-secret-key-here!!!"; // 32 chars
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypt data using AES-256-CBC
 * @param {string} text - Text to encrypt
 * @returns {string} - Encrypted text in hex format
 */
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipher("aes-256-cbc", ENCRYPTION_KEY);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Decrypt data using AES-256-CBC
 * @param {string} text - Encrypted text
 * @returns {string} - Decrypted text
 */
function decrypt(text) {
  const parts = text.split(":");
  const iv = Buffer.from(parts.shift(), "hex");
  const encryptedText = parts.join(":");
  const decipher = crypto.createDecipher("aes-256-cbc", ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Saves the access token securely and encrypted
 * @param {Object} tokenData - Access token data
 * @returns {Promise<void>}
 */
async function saveTokens(tokenData) {
  try {
    const dataToSave = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      expires_at: Date.now() + tokenData.expires_in * 1000,
      scopes: tokenData.scope || process.env.TWITCH_SCOPES,
      saved_at: Date.now(),
    };

    const encryptedData = encrypt(JSON.stringify(dataToSave));
    await fs.writeFile(TOKEN_FILE, encryptedData, "utf8");

    console.log("🔐 Tokens saved securely to disk");
  } catch (error) {
    console.error("❌ Error saving tokens:", error.message);
  }
}

/**
 * Loads and decrypts the access token from disk
 * @returns {Promise<Object|null>} - Token data or null if not found
 */
async function loadTokens() {
  try {
    const encryptedData = await fs.readFile(TOKEN_FILE, "utf8");
    const decryptedData = decrypt(encryptedData);
    const tokenData = JSON.parse(decryptedData);

    // Check if the token has not expired
    if (tokenData.expires_at && Date.now() < tokenData.expires_at) {
      console.log("✅ Valid tokens loaded from disk");
      return tokenData;
    } else {
      console.log("⚠️ Stored tokens have expired, will authenticate again");
      await deleteTokens(); // Clear expired tokens
      return null;
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log("ℹ️ No stored tokens found, will authenticate");
    } else {
      console.error("❌ Error loading tokens:", error.message);
    }
    return null;
  }
}

/**
 * Deletes the stored tokens from disk
 * @returns {Promise<void>}
 */
async function deleteTokens() {
  try {
    await fs.unlink(TOKEN_FILE);
    console.log("🗑️ Stored tokens deleted");
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("❌ Error deleting tokens:", error.message);
    }
  }
}

/**
 * Verifies if the token needs to be refreshed
 * @param {Object} tokenData - Token data
 * @returns {boolean} - True if it needs refresh
 */
function needsRefresh(tokenData) {
  if (!tokenData.expires_at) return true;

  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  return Date.now() > tokenData.expires_at - fiveMinutes;
}

/**
 * Stores tokens in memory securely (alternative to global)
 */
class TokenManager {
  constructor() {
    this.tokens = null;
    this.isLoaded = false;
  }

  async initialize() {
    if (!this.isLoaded) {
      this.tokens = await loadTokens();
      this.isLoaded = true;
    }
    return this.tokens;
  }

  setTokens(tokenData) {
    this.tokens = tokenData;
    // Also save to disk
    saveTokens(tokenData);
  }

  getTokens() {
    return this.tokens;
  }

  clearTokens() {
    this.tokens = null;
    deleteTokens();
  }

  needsRefresh() {
    return this.tokens ? needsRefresh(this.tokens) : true;
  }
}

// Singleton instance of the token manager
const tokenManager = new TokenManager();

module.exports = {
  saveTokens,
  loadTokens,
  deleteTokens,
  needsRefresh,
  tokenManager,
  encrypt,
  decrypt,
};
