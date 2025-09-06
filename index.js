const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import routes and middleware
const indexRoutes = require("./routes/index");
const twitchRoutes = require("./routes/twitch");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const { onServerStart } = require("./utils/serverUtils");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", indexRoutes);
app.use("/api/twitch", twitchRoutes);

// Error handling middleware
app.use("*", notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  onServerStart(PORT);
});

module.exports = app;
