const express = require("express");
const { name, version } = require("../package.json");

const router = express.Router();

// Base route
router.get("/", (_req, res) => {
  res.json({
    message: `${name} is running!`,
    version: version,
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
router.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
