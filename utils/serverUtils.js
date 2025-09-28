const { name, version } = require("../package.json");
const { manageTwitchLogin } = require("../routes/twitch");

/**
 * Function to handle server start
 * Obtains and refreshes the Twitch API access token
 * @param {*} port Port where the server is running
 */
const onServerStart = async (port) => {
  logServerStart(port);

  manageTwitchLogin();
};

/**
 * Function to log server start information
 * Shows util information about the server
 */
const logServerStart = (port) => {
  console.log("=".repeat(50));
  console.log(`🚀  ${name} v${version} is running!`);
  console.log(`📡  Server listening on port: ${port}`);
  console.log(`🌐  Local URL: http://localhost:${port}`);
  console.log(`📝  Health check: /health`);
  console.log(`⏰  Started at: ${new Date().toLocaleString()}`);
  console.log(`🌍  Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("=".repeat(50));

  // Log loaded environment variables (excluding sensitive info)
  const envVars = [
    "NODE_ENV",
    "PORT",
    "TWITCH_CLIENT_ID",
    "TWITCH_CLIENT_SECRET",
    "TWITCH_SCOPES",
  ];

  const loadedEnvVars = envVars.filter((envVar) => process.env[envVar]);
  if (loadedEnvVars.length > 0) {
    console.log("\n📋  Environment variables status:");
    loadedEnvVars.forEach((envVar) => {
      const value =
        envVar.includes("SECRET") ||
        envVar.includes("TOKEN") ||
        envVar.includes("ID")
          ? "🔒  SECURED"
          : `✅  ${process.env[envVar]}`;
      const varName = envVar.padEnd(19);
      const status = value.padEnd(16);
      console.log(`${varName}: ${status}`);
    });
  }

  console.log("=".repeat(50));
};

/**
 * Function to handle graceful server shutdown
 */
const onServerShutdown = () => {
  console.log("\n🛑  SHUTTING DOWN SERVER");
  console.log("🔄  Graceful shutdown...");
  console.log("👋  Goodbye!");
};

// Handle process termination signals
process.on("SIGTERM", onServerShutdown);
process.on("SIGINT", onServerShutdown);

module.exports = {
  onServerStart: onServerStart,
  onServerShutdown,
};
