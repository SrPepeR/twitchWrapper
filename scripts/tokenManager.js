/**
 * Utilities script to manage stored tokens
 * Allows viewing token status, clearing them, etc.
 */

require("dotenv").config();
const {
  tokenManager,
  loadTokens,
  deleteTokens,
} = require("../utils/tokenStorage");

async function main() {
  const command = process.argv[2];

  switch (command) {
    case "status":
      await showTokenStatus();
      break;
    case "clear":
      await clearStoredTokens();
      break;
    case "help":
    default:
      showHelp();
      break;
  }
}

async function showTokenStatus() {
  console.log("📊 TOKEN STATUS REPORT");
  console.log("=====================");

  try {
    const tokens = await loadTokens();
    if (tokens) {
      const expiresAt = new Date(tokens.expires_at);
      const now = new Date();
      const timeUntilExpiry = Math.max(0, expiresAt - now);
      const minutesLeft = Math.floor(timeUntilExpiry / (1000 * 60));

      console.log("✅ Tokens found and valid");
      console.log(`📅 Expires at: ${expiresAt.toLocaleString()}`);
      console.log(`⏱️  Time remaining: ${minutesLeft} minutes`);
      console.log(`🎯 Scopes: ${tokens.scopes}`);
      console.log(`💾 Saved at: ${new Date(tokens.saved_at).toLocaleString()}`);

      if (timeUntilExpiry < 5 * 60 * 1000) {
        // Less than 5 minutes
        console.log("⚠️  WARNING: Tokens will expire soon!");
      }
    } else {
      console.log("❌ No valid tokens found");
    }
  } catch (error) {
    console.error("❌ Error checking token status:", error.message);
  }
}

async function clearStoredTokens() {
  console.log("🗑️  CLEARING STORED TOKENS");
  console.log("==========================");

  try {
    await deleteTokens();
    console.log("✅ Stored tokens have been cleared");
    console.log("ℹ️  Next server start will require authentication");
  } catch (error) {
    console.error("❌ Error clearing tokens:", error.message);
  }
}

function showHelp() {
  console.log("🛠️  TOKEN MANAGEMENT UTILITY");
  console.log("============================");
  console.log("");
  console.log("Available commands:");
  console.log("  status  - Show current token status");
  console.log("  clear   - Clear stored tokens");
  console.log("  help    - Show this help message");
  console.log("");
  console.log("Examples:");
  console.log("  node scripts/tokenManager.js status");
  console.log("  node scripts/tokenManager.js clear");
}

main().catch(console.error);
