const { name, version } = require("../package.json");

/**
 * Function to log server start information
 * Shows util information about the server
 */
const onServerStart = (port) => {
  console.log("=".repeat(50));
  console.log(`🚀 ${name} v${version} is running!`);
  console.log(`📡 Server listening on port: ${port}`);
  console.log(`🌐 Local URL: http://localhost:${port}`);
  console.log(`📝 Health check: http://localhost:${port}/health`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("=".repeat(50));

  // Log loaded environment variables (excluding sensitive info)
  const envVars = [
    "NODE_ENV",
    "PORT",
    "TWITCH_CLIENT_ID",
    "TWITCH_CLIENT_SECRET",
  ];

  const loadedEnvVars = envVars.filter((envVar) => process.env[envVar]);
  if (loadedEnvVars.length > 0) {
    console.log("📋 Environment variables loaded:");
    loadedEnvVars.forEach((envVar) => {
      const value =
        envVar.includes("SECRET") || envVar.includes("TOKEN")
          ? "***HIDDEN***"
          : process.env[envVar];
      console.log(`   - ${envVar}: ${value}`);
    });
  }

  console.log("=".repeat(50));
};

/**
 * Function to handle graceful server shutdown
 */
const onServerShutdown = () => {
  console.log("\n🛑 Shutting down server gracefully...");
  console.log("👋 Goodbye!");
};

// Handle process termination signals
process.on("SIGTERM", onServerShutdown);
process.on("SIGINT", onServerShutdown);

module.exports = {
  onServerStart,
  onServerShutdown,
};
