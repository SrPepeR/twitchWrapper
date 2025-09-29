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

// Validates a Twitch access token
// - Uses provided token from request body or Authorization header
// - Falls back to global token if no token provided
router.post("/validate", async (req, res, next) => {
  try {
    const { validateToken } = require("./twitch");

    // Get token from body or Authorization header
    const token =
      req.body.token ||
      (req.headers.authorization &&
        req.headers.authorization.replace("Bearer ", ""));

    const validationResult = await validateToken(token);

    if (validationResult.valid) {
      res.json({
        status: "OK",
        valid: true,
        token_info: {
          client_id: validationResult.client_id,
          login: validationResult.login,
          user_id: validationResult.user_id,
          scopes: validationResult.scopes,
          expires_in: validationResult.expires_in,
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(validationResult.status || 401).json({
        status: "Invalid token",
        valid: false,
        error: validationResult.error,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    next(error);
  }
});

// Gets a random chatter from the Twitch channel
router.get("/random-chatter", async (_req, res, next) => {
  try {
    const { getRandomChatter } = require("./twitch");
    const choosenChatter = await getRandomChatter();

    if (!choosenChatter) {
      return res.status(204).json({
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

// Gets clips from a Twitch channel filtering by:
// - an optional tag that represents a date range like "today", "week", "month", "year", "all" (by default "year")
// - an optional limit on the number of clips to return (default: 10)
router.get("/clips/:fromTag?/:limit?", async (req, res, next) => {
  try {
    const { getClips } = require("./twitch");
    const fromTag = req.params.fromTag || "year";
    const limit = parseInt(req.params.limit, 10) || 10;

    const clips = await getClips(fromTag, limit);

    if (!clips || clips.length === 0) {
      return res.status(204).json({
        status: "No clips found",
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      status: "OK",
      clips: clips,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
