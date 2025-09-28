const axios = require("axios");
const { tokenManager } = require("../utils/tokenStorage");

/**
 * Manages the complete Twitch login authentication flow.
 *
 * This function orchestrates the OAuth device flow authentication process for Twitch API access.
 * It handles user code generation, token polling, and keeps the authentication alive.
 * If any step fails, the process exits with an error.
 *
 * @async
 * @function manageTwitchLogin
 * @returns {Promise<void>} A promise that resolves when authentication is complete
 * @throws {Error} Throws an error if any step in the authentication process fails
 *
 * @requires axios - HTTP client for making requests
 * @requires process.env.TWITCH_CLIENT_ID - Twitch application client ID from environment variables
 * @requires process.env.TWITCH_SCOPES - Space-separated list of OAuth scopes from environment variables
 */
async function manageTwitchLogin() {
  try {
    console.log("\n🔐 Starting Twitch API authentication...");

    // try to load existing tokens from storage
    const existingTokens = await tokenManager.initialize();

    if (existingTokens && !tokenManager.needsRefresh()) {
      console.log("✅ Using existing valid tokens from storage");
      global.twitchAccessToken = existingTokens;
      manageKeepAlive(existingTokens);
      return;
    }

    // If no valid tokens, start authentication process
    if (existingTokens && tokenManager.needsRefresh()) {
      console.log("🔄 Tokens need refresh, attempting to refresh...");
      try {
        const refreshedTokens = await refreshAccessToken(
          existingTokens.refresh_token
        );
        tokenManager.setTokens(refreshedTokens);
        global.twitchAccessToken = refreshedTokens;
        manageKeepAlive(refreshedTokens);
        return;
      } catch (refreshError) {
        console.log("⚠️ Token refresh failed, starting new authentication...");
      }
    }

    // Complete authentication process
    const userCodeData = await getUserCode();
    logUserCode(userCodeData);

    const accessToken = await pollForAccessToken(userCodeData);
    logAccessToken(accessToken);

    // Save tokens securely
    tokenManager.setTokens(accessToken);
    global.twitchAccessToken = accessToken;

    manageKeepAlive(accessToken);
  } catch (error) {
    console.log("\n❌ AUTHENTICATION FAILED");
    console.log(`⚠️ Error: ${error.message}`);
    console.log("🛑 Server will shut down...");
    process.exit(1);
  }
}

/**
 * Initiates the OAuth 2.0 device authorization flow for Twitch by requesting a device code.
 *
 * This function sends a POST request to Twitch's OAuth device endpoint with the client ID
 * and requested scopes to obtain a device code and user code that can be used for authentication.
 *
 * @async
 * @function getUserCode
 * @returns {Promise<Object>} A promise that resolves to the response data containing:
 *   - device_code: The device verification code
 *   - user_code: The user verification code to be displayed to the user
 *   - verification_uri: The URI where the user should go to authorize the device
 *   - expires_in: The lifetime in seconds of the device_code and user_code
 *   - interval: The minimum amount of time in seconds that the app should wait between polling requests
 * @throws {Error} Throws an error if the request fails or if there's a network issue
 *
 * @requires axios - HTTP client for making requests
 * @requires process.env.TWITCH_CLIENT_ID - Twitch application client ID from environment variables
 * @requires process.env.TWITCH_SCOPES - Space-separated list of OAuth scopes from environment variables
 *
 * @example
 * try {
 *   const deviceData = await getUserCode();
 *   console.log('User code:', deviceData.user_code);
 *   console.log('Verification URI:', deviceData.verification_uri);
 * } catch (error) {
 *   console.error('Failed to get user code:', error);
 * }
 */
const getUserCode = async () => {
  try {
    // Create form data for form-urlencoded request
    const formData = new URLSearchParams();
    formData.append("client_id", process.env.TWITCH_CLIENT_ID);
    formData.append("scopes", process.env.TWITCH_SCOPES);

    const response = await axios.post(
      "https://id.twitch.tv/oauth2/device",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "\n❌ Error obtaining device code:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Logs user authorization information for OAuth device flow authentication.
 * Displays the verification URL, user code, expiration time, and authorization status.
 *
 * @param {Object} userCodeData - The user code data object from the OAuth provider
 * @param {string} userCodeData.verification_uri - The URL where the user should authorize the application
 * @param {string} userCodeData.user_code - The code that the user needs to enter for authorization
 * @param {number} userCodeData.expires_in - The number of seconds until the code expires
 */
function logUserCode(userCodeData) {
  const expiresAt = new Date(
    Date.now() + userCodeData.expires_in * 1000
  ).toLocaleString();

  console.log("📋  Please complete the following steps:");
  console.log("\t1️⃣  Visit this URL in your browser:");
  console.log(`\t\t🌐  ${userCodeData.verification_uri}`);
  console.log("\t2️⃣  Enter this authorization code:");
  console.log(`\t\t🔑  ${userCodeData.user_code}`);
  console.log(`\t\t⏱️  Code expires at: ${expiresAt}`);
  console.log("\n⏳  Waiting for user authorization...");
}

/**
 * Polls for access token after user authorization
 * @param {Object} userCodeData - Device code data from Twitch API
 * @returns {Promise<string>} Access token
 */
const pollForAccessToken = async (userCodeData) => {
  const pollInterval = 2000; // Poll every 2 seconds
  const maxAttempts = 100; // Maximum number of polling attempts
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const formData = new URLSearchParams({
        client_id: process.env.TWITCH_CLIENT_ID,
        scopes: process.env.TWITCH_SCOPES,
        device_code: userCodeData.device_code,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      });

      const response = await axios.post(
        "https://id.twitch.tv/oauth2/token",
        formData,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      return response.data;
    } catch (error) {
      attempts++;
      // Increase polling interval as requested by API
      await new Promise((resolve) => setTimeout(resolve, pollInterval * 2));
    }
  }

  throw new Error(
    "Authorization timeout: User did not authorize within the time limit"
  );
};

/**
 * Logs successful Twitch API authentication and token expiration information to the console.
 *
 * @param {Object} accessToken - The access token object returned from Twitch API authentication
 * @param {number} accessToken.expires_in - The token lifetime in seconds from the current time
 */
function logAccessToken(accessToken) {
  const expiresAt = new Date(
    Date.now() + accessToken.expires_in * 1000
  ).toLocaleString();

  console.log("\n✅  AUTHENTICATION SUCCESSFUL!");
  console.log("🎉  Successfully logged into Twitch API!");
  console.log(`⏰  Token expires at: ${expiresAt}`);
  console.log("🔄  Auto-refresh enabled");
  console.log("\n🚀  Ready to make Twitch API requests!\n");
}

/**
 * Manages the automatic refresh of Twitch access tokens to keep them alive.
 *
 * This function stores the provided access token globally and sets up a timeout
 * to automatically refresh the token before it expires. The refresh is scheduled
 * to occur 10 seconds before the token's expiration time to ensure continuity.
 *
 * @param {Object} accessToken - The Twitch access token object
 * @param {string} accessToken.refresh_token - The refresh token used to obtain a new access token
 * @param {number} accessToken.expires_in - The token expiration time in seconds
 * @returns {void}
 *
 * @example
 * const tokenData = {
 *   access_token: 'abc123',
 *   refresh_token: 'def456',
 *   expires_in: 3600
 * };
 * manageKeepAlive(tokenData);
 */
async function manageKeepAlive(accessToken) {
  // Update tokens in the manager and globally
  tokenManager.setTokens(accessToken);
  global.twitchAccessToken = accessToken;

  setTimeout(async () => {
    try {
      console.log("\n🔄  Token refresh scheduled - refreshing access token...");
      const newAccessToken = await refreshAccessToken(
        accessToken.refresh_token
      );
      manageKeepAlive(newAccessToken);
    } catch (error) {
      console.error("❌  Error refreshing access token:", error);
      // If an error occurs, clear tokens and retry authentication
      tokenManager.clearTokens();
      setTimeout(() => {
        console.log("🔄 Retrying authentication...");
        manageTwitchLogin();
      }, 5000); // Retry in 5 seconds
    }
  }, (accessToken.expires_in - 10) * 1000); // Refresh 10 seconds before expiration
}

/**
 * Refreshes a Twitch OAuth2 access token using a refresh token
 * @async
 * @function refreshAccessToken
 * @param {string} refreshToken - The refresh token to use for obtaining a new access token
 * @returns {Promise<Object>} Promise that resolves to the response data containing the new access token and related information
 * @throws {Error} Throws an error if the token refresh request fails
 * @description Makes a POST request to Twitch's OAuth2 token endpoint to refresh an expired access token.
 * Requires TWITCH_CLIENT_ID environment variable to be set.
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    const formData = new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const response = await axios.post(
      "https://id.twitch.tv/oauth2/token",
      formData,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    console.log("🔄  Access token refreshed successfully.");
    return response.data;
  } catch (error) {
    console.error(
      "\n❌  Error refreshing access token:",
      error.response?.data || error.message
    );
    throw error;
  }
};

getRandomChatter = async (cursor, choosenChatterIndex, lastChatterIndex) => {
  try {
    if (!global.twitchAccessToken) {
      throw new Error("No access token available. Please authenticate first.");
    }

    const broadcasterId = process.env.TWITCH_BROADCASTER_ID;
    const moderatorId = process.env.TWITCH_MODERATOR_ID;

    if (!broadcasterId || !moderatorId) {
      throw new Error(
        "TWITCH_BROADCASTER_ID and TWITCH_MODERATOR_ID must be set in environment variables."
      );
    }

    const response = await axios.get(
      `https://api.twitch.tv/helix/chat/chatters?broadcaster_id=${broadcasterId}&moderator_id=${moderatorId}&first=1000` +
        (cursor ? `&after=${cursor}` : ""),
      {
        headers: {
          Authorization: `Bearer ${global.twitchAccessToken.access_token}`,
          "Client-Id": process.env.TWITCH_CLIENT_ID,
        },
      }
    );

    const chatters = response.data;
    const chattersCount = chatters.total;

    if (chattersCount === 0) {
      console.log("No chatters found in the channel.");
      return null;
    }

    if (!choosenChatterIndex)
      choosenChatterIndex = Math.floor(Math.random() * chattersCount);

    if (choosenChatterIndex > 1000 && choosenChatterIndex > lastChatterIndex) {
      lastChatterIndex += 1000;

      return getRandomChatter(
        chatters.pagination.cursor,
        choosenChatterIndex,
        lastChatterIndex
      );
    }

    return chatters.data[choosenChatterIndex].user_name;
  } catch (error) {
    console.error(
      "❌  Error fetching chatters:",
      error.response?.data || error.message
    );
  }
};

module.exports = { manageTwitchLogin, getRandomChatter };
