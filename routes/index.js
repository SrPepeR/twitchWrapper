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

router.get("/random-chatter", async (_req, res, next) => {
  try {
    const { getRandomChatter } = require("./twitch");
    const choosenChatter = await getRandomChatter();

    if (!choosenChatter) {
      return res.status(404).json({
        status: "No chatters found",
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      status: "OK",
      user: choosenChatter,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
