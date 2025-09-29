# TwitchWrapper

A Node.js wrapper for the Twitch API, designed to simplify integration and provide easy access to Twitch data. This Express.js server implements OAuth 2.0 device flow authentication and provides secure token management with automatic refresh capabilities.

## Features

- **Express.js server** with CORS support and comprehensive error handling
- **Twitch API OAuth 2.0 Device Flow** authentication with automatic token refresh
- **Secure token storage** with AES-256-CBC encryption
- **Automatic token management** with expiration handling and refresh mechanisms
- **Random chatter selection** from Twitch chat
- **Twitch clips retrieval** with flexible date filtering and customizable limits
- **Health check endpoint** for monitoring
- **Dynamic version display** from package.json
- **Environment variable configuration** for secure setup
- **Intelligent server management** with automatic cleanup of previous instances
- **Development workflow optimization** with clean restart capabilities
- **Ready for Vercel deployment** with optimized configuration

## API Endpoints

### Core Endpoints

- `GET /` - Main endpoint with application information and current version
- `GET /health` - Health check endpoint with server uptime

### Twitch Integration

- `GET /random-chatter` - Returns a random user from the broadcaster's chat
- `GET /clips/:fromTag?/:limit?` - Get Twitch clips with optional date filter and optional limit
- `POST /validate` - Validate a Twitch access token (accepts token in request body or or Authorization header)

## Prerequisites

Before running this application, you need:

1. **Node.js** (version 18.x or higher)
2. **Twitch Developer Account** and application registered at [Twitch Developers Console](https://dev.twitch.tv/console)
3. **Environment variables** configured (see setup section below)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000

# Twitch API Configuration
TWITCH_CLIENT_ID=your_twitch_client_id_here
TWITCH_SCOPES=moderator:read:chatters
TWITCH_BROADCASTER_ID=your_broadcaster_id_here
TWITCH_MODERATOR_ID=your_moderator_id_here or your_broadcaster_id_here

# Security - Generate using scripts/generateEncryptionKey.js
ENCRYPTION_KEY=your_32_char_encryption_key_here
```

### 3. Generate Encryption Key

Run the encryption key generation script to create a secure key:

```bash
node scripts/generateEncryptionKey.js
```

Copy the generated key to your `.env` file under `ENCRYPTION_KEY`.

### 4. Configure Twitch Application

1. Visit [Twitch Developers Console](https://dev.twitch.tv/console)
2. Create a new application or select an existing one
3. Set the **OAuth Redirect URL** to: `http://localhost`
4. Note down your **Client ID**
5. Find your **Broadcaster ID** and **Moderator ID** (you can use tools like [Twitch Username to ID Converter](https://www.streamweasels.com/support/convert-twitch-username-to-user-id/))

### 5. Run the Application

**For development (recommended):**

```bash
npm run dev:clean
```

**For development (standard):**

```bash
npm run dev
```

**For production:**

```bash
npm start
```

#### New Development Commands

The project now includes intelligent server management commands:

- **`npm run dev:clean`** - ⭐ **Recommended for development**: Automatically kills any previous server instances and starts a fresh development server
- **`npm run kill`** - Kills all running server instances without starting a new one
- **`npm run dev`** - Standard development server start (may conflict with existing instances)

The `dev:clean` command is particularly useful because it:

1. 🔍 Automatically detects and terminates existing server processes
2. 🌐 Clears processes using common development ports (3000-3006)
3. 🚀 Starts a fresh server instance without port conflicts
4. 📋 Provides detailed feedback about what was cleaned up

## Authentication Flow

The application uses Twitch's OAuth 2.0 Device Flow for secure authentication:

1. **Server Start**: The application automatically initiates the authentication process
2. **Device Code**: A device code and user code are generated
3. **User Authorization**: You'll see a URL and code in the console that you need to visit and enter
4. **Token Management**: Once authorized, tokens are securely stored and automatically refreshed
5. **API Access**: The application can now make authenticated requests to the Twitch API

### Authentication Process Example

``` text
🔐 Starting Twitch API authentication...
📋 Please complete the following steps:
    1️⃣ Visit this URL in your browser:
        🌐 https://www.twitch.tv/activate
    2️⃣ Enter this authorization code:
        🔑 ABCD-EFGH
    ⏱️ Code expires at: 12/25/2023, 10:30:00 AM
⏳ Waiting for user authorization...
✅ AUTHENTICATION SUCCESSFUL!
🎉 Successfully logged into Twitch API!
```

## Clips Endpoint

The `/clips` endpoint provides access to Twitch clips from the configured broadcaster's channel with flexible filtering options.

### Usage

```bash
GET /clips/:fromTag?/:limit?
```

### Parameters

- **`fromTag`** (optional): Time range filter for clips
  - `"today"` - Clips from the last 24 hours
  - `"week"` - Clips from the last 7 days  
  - `"month"` - Clips from the last 30 days
  - `"year"` - Clips from the last 365 days (default)
  - `"all"` - All available clips (no date filter)

- **`limit`** (optional): Number of clips to return
  - Range: 1-100 (Twitch API limitation)
  - Default: 10

### Examples

```bash
# Get last 10 clips from the past year (default)
GET /clips

# Get last 5 clips from this week
GET /clips/week/5

# Get last 20 clips from today
GET /clips/today/20

# Get all clips from the past month
GET /clips/month

# Get all available clips (no time filter)
GET /clips/all/100
```

### Response Format

Successful responses include an array of clip objects with detailed metadata including view counts, creation dates, thumbnails, and direct links to the clips.

## Token Security

The application implements several security measures:

- **AES-256-CBC encryption** for token storage
- **Automatic token refresh** before expiration
- **Secure file storage** with encrypted token files
- **Environment-based encryption keys** for enhanced security

## Deployment

### Vercel Deployment

This project is optimized for Vercel deployment:

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy using Vercel CLI:

```bash
vercel
```

### Manual Deployment

For other platforms, ensure:

1. Node.js 18.x+ is available
2. All environment variables are set
3. The server can write to the filesystem for token storage

## Project Structure

```text
├── index.js                 # Main server entry point
├── package.json             # Dependencies and project configuration
├── vercel.json              # Vercel deployment configuration
├── .env                     # Environment variables (not in version control)
├── routes/                  # API route handlers
│   ├── index.js            # Main application routes (/, /health, /random-chatter)
│   └── twitch.js           # Twitch API authentication and integration logic
├── middleware/              # Express middleware
│   └── errorHandler.js     # Centralized error handling middleware
├── utils/                   # Utility functions
│   ├── serverUtils.js      # Server startup and shutdown utilities
│   └── tokenStorage.js     # Secure token storage and encryption utilities
├── scripts/                 # Utility scripts
│   ├── generateEncryptionKey.js  # Generates secure encryption keys
│   ├── killServer.js       # Intelligent server instance cleanup utility
│   └── tokenManager.js     # Token management utilities (if needed)
└── README.md               # Project documentation
```

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `3000` |
| `TWITCH_CLIENT_ID` | Twitch application client ID | Yes | `abc123def456` |
| `TWITCH_SCOPES` | OAuth scopes (space-separated) | Yes | `moderator:read:chatters` |
| `TWITCH_BROADCASTER_ID` | Twitch broadcaster user ID | Yes | `123456789` |
| `TWITCH_MODERATOR_ID` | Twitch moderator user ID | Yes | `987654321` |
| `ENCRYPTION_KEY` | 32-character encryption key | Yes | Generate with provided script |

## API Response Examples

### GET /

```json
{
  "message": "twitchwrapper is running!",
  "version": "0.0.3",
  "timestamp": "2023-12-25T10:00:00.000Z"
}
```

### GET /health

```json
{
  "status": "OK",
  "uptime": 3600.123,
  "timestamp": "2023-12-25T10:00:00.000Z"
}
```

### GET /random-chatter

```json
{
  "status": "OK",
  "user": "some_viewer_username",
  "timestamp": "2023-12-25T10:00:00.000Z"
}
```

### GET /clips/:fromTag?/:limit?

**Example request:** `GET /clips/week/5`

```json
{
  "status": "OK",
  "clips": [
    {
      "id": "AwkwardHelplessSalamanderSwiftRage",
      "url": "https://clips.twitch.tv/AwkwardHelplessSalamanderSwiftRage",
      "embed_url": "https://clips.twitch.tv/embed?clip=AwkwardHelplessSalamanderSwiftRage",
      "broadcaster_id": "67955580",
      "broadcaster_name": "ChewieMelodies",
      "creator_id": "53834192",
      "creator_name": "TwitchDev",
      "video_id": "205586603",
      "game_id": "488191",
      "language": "en",
      "title": "babymetal",
      "view_count": 10,
      "created_at": "2017-11-30T22:34:18Z",
      "thumbnail_url": "https://clips-media-assets.twitch.tv/157589949-preview-480x272.jpg",
      "duration": 12.9
    }
  ],
  "timestamp": "2023-12-25T10:00:00.000Z"
}
```

**Parameters:**

- `fromTag` (optional): Date range filter - `"today"`, `"week"`, `"month"`, `"year"`, `"all"` (default: `"year"`)
- `limit` (optional): Number of clips to return, max 100 (default: `10`)

### POST /validate

Validates a Twitch access token using Twitch's OAuth validation endpoint.

**Example request:** `POST /validate with the token in request body.

**Response (valid token):**

```json
{
  "status": "OK",
  "valid": true,
  "tokenInfo": {
    "client_id": "your_client_id",
    "login": "twitchdev",
    "scopes": ["channel:read:subscriptions", "chat:read"],
    "user_id": "141981764",
    "expires_in": 5520838
  },
  "timestamp": "2023-12-25T10:00:00.000Z"
}
```

**Response (invalid token):**

```json
{
  "status": "Error",
  "valid": false,
  "error": "Token validation failed from twitch: Token validation failed",
  "timestamp": "2023-12-25T10:00:00.000Z"
}
```

**Parameters:**

- `token` (optional): Access token to validate. Can be provided via:
  **Request body (JSON):**

  ```json
  {
    "token": "your_access_token_here"
  }
  ```

  **OR** - Authorization header: `Authorization: Bearer your_token`
  - If not provided, uses the global stored token

## Error Handling

The application includes comprehensive error handling:

- **Authentication errors**: Automatically retry with proper error messages
- **API errors**: Graceful handling of Twitch API failures
- **Token expiration**: Automatic refresh with fallback re-authentication
- **Network errors**: Retry mechanisms for transient failures

## Development

### Scripts Available

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run dev:clean` - **⭐ RECOMMENDED**: Kill previous instances and start fresh development server
- `npm run kill` - Kill all running server instances
- `npm run generateEncryptionKey` - Generate a new encryption key

### Development Workflow

For daily development, it's recommended to use the clean development command:

```bash
npm run dev:clean
```

This command will:

1. 🔍 Search for and terminate any existing server instances
2. 🧹 Clean up processes using common ports (3000-3006)
3. 🚀 Start a fresh development server with nodemon

#### Managing Server Instances

Sometimes you may have multiple server instances running that can cause port conflicts. Use these commands to manage them:

**Kill all server instances:**

```bash
npm run kill
```

**Start development server normally:**

```bash
npm run dev
```

**Kill and restart in one command (recommended):**

```bash
npm run dev:clean
```

### Server Instance Management

The project includes an intelligent server cleanup system that:

- **🔍 Smart Detection**: Automatically finds running instances by process name and project directory
- **🌐 Port Cleanup**: Checks and clears processes using ports 3000-3006
- **📋 Detailed Reporting**: Shows exactly what processes were found and terminated
- **✅ Verification**: Confirms successful cleanup before starting new instances

#### Kill Server Script

The `scripts/killServer.js` utility provides comprehensive server cleanup with:

- Process detection by multiple patterns (nodemon, node, project-specific)
- Port-based process identification and termination
- Detailed logging of cleanup operations
- Final verification of remaining processes

**Example output:**

``` text
🔍 Searching for running TwitchWrapper server instances...

🎯 Project: twitchWrapper
📁 Directory: /home/user/twitchWrapper

🛑 Starting cleanup process...

🔍 Checking for: Nodemon processes running index.js
   📋 Found PIDs: 12345, 67890
   ✅ Killed process 12345
   ✅ Killed process 67890

🌐 Checking processes on ports: 3000, 3001, 3002, 3003, 3004, 3005, 3006
   ✅ Killed process on port 3000

🧹 Cleanup complete!
✨ All TwitchWrapper server instances have been terminated.
```

## Security Considerations

- Keep your `.env` file secure and never commit it to version control
- Regularly rotate your encryption key if needed
- Monitor token usage and expiration
- Use HTTPS in production environments
- Regularly update dependencies

## Troubleshooting

### Common Issues

1. **Authentication fails**: Check your Twitch Client ID and ensure redirect URL is correct
2. **Token decryption errors**: Verify your encryption key is correctly set
3. **API errors**: Ensure broadcaster and moderator IDs are correct
4. **Permission errors**: Verify your Twitch application has the required scopes
5. **Port conflicts**: Use `npm run kill` or `npm run dev:clean` to clear conflicting server instances
6. **Server won't start**: Check if another instance is running with `npm run kill` and try again

### Development Issues

**Multiple server instances running:**

```bash
npm run dev:clean  # Recommended: kills old instances and starts fresh
```

**Manual cleanup:**

```bash
npm run kill       # Just kills instances without starting new one
```

**Port already in use errors:**

- The server automatically finds available ports (3000-3006)
- Use `npm run kill` to clean up any stuck processes
- Check the console output for the actual port being used

### Logging

The application provides detailed console logging for:

- Authentication flow status
- Token management operations
- API request results
- Error conditions

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Author

***Kevin J. Rodríguez***

## Version History

- **0.0.3** - Added token validation endpoint and enhanced authentication flow with automatic token validation on startup
- **0.0.2** - Added Twitch clips endpoint with date filtering, intelligent server instance management, and development workflow improvements
- **0.0.1** - Initial release with OAuth 2.0 device flow, secure token storage, and random chatter API
