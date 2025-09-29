const { name, version } = require("../package.json");
const { manageTwitchLogin } = require("../routes/twitch");
const net = require("net");

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
let shutdownInProgress = false;

const onServerShutdown = () => {
  if (shutdownInProgress) {
    return; // Prevent multiple shutdowns
  }

  shutdownInProgress = true;
  console.log("\n🛑  SHUTTING DOWN SERVER");
  console.log("🔄  Graceful shutdown...");
  console.log("👋  Goodbye!");

  // Give a moment for cleanup, then exit
  setTimeout(() => {
    process.exit(0);
  }, 100);
};

// Handle process termination signals
process.on("SIGTERM", onServerShutdown);
process.on("SIGINT", onServerShutdown);

/**
 * Check if a port is available
 * @param {number} port - Port to check
 * @returns {Promise<boolean>} - True if port is available, false otherwise
 */
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.listen(port, () => {
      server.close(() => {
        resolve(true);
      });
    });

    server.on("error", () => {
      resolve(false);
    });
  });
};

/**
 * Find an available port starting from the given port
 * @param {number} startPort - Starting port to check
 * @param {number} maxPort - Maximum port to check (default: 65535)
 * @returns {Promise<number>} - Available port number
 */
const findAvailablePort = async (startPort, maxPort = 65535) => {
  for (let port = startPort; port <= maxPort; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(
    `No available ports found between ${startPort} and ${maxPort}`
  );
};

/**
 * Start server with automatic port detection
 * @param {Object} app - Express app instance
 * @param {number} preferredPort - Preferred port to start with
 * @returns {Promise<number>} - The port the server is actually running on
 */
const startServerWithPortFinding = async (app, preferredPort) => {
  try {
    const availablePort = await findAvailablePort(preferredPort);

    if (availablePort !== preferredPort) {
      console.log(
        `⚠️  Port ${preferredPort} is occupied, using port ${availablePort} instead`
      );
    }

    return new Promise((resolve, reject) => {
      const server = app.listen(availablePort, (error) => {
        if (error) {
          reject(error);
        } else {
          onServerStart(availablePort);
          resolve(availablePort);
        }
      });

      server.on("error", reject);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error.message);
    throw error;
  }
};

module.exports = {
  onServerStart: onServerStart,
  onServerShutdown,
  isPortAvailable,
  findAvailablePort,
  startServerWithPortFinding,
};
