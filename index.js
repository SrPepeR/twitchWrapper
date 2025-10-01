const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import routes and middleware
const indexRoutes = require("./routes/index");
const {
  notFoundHandler,
  errorHandler,
  unauthorizedHandler,
} = require("./middleware/errorHandler");
const { startServerWithPortFinding } = require("./utils/serverUtils");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", indexRoutes);

// Error handling middleware
app.use("*", notFoundHandler);
app.use(unauthorizedHandler);
app.use(errorHandler);

// Start server with automatic port detection
(async () => {
  try {
    const actualPort = await startServerWithPortFinding(app, PORT);
    console.log(`✅ Server successfully started on port ${actualPort}`);
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
})();

module.exports = app;
