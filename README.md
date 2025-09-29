# TwitchWrapper

A Node.js wrapper for the Twitch API, designed to simplify integration and provide easy access to Twitch data. This Express.js server implements OAuth 2.0 device flow authentication and provides secure token management with automatic refresh capabilities.

## Features

- **Express.js server** with CORS support and comprehensive error handling
- **Twitch API OAuth 2.0 Device Flow** authentication with automatic token refresh
- **Secure token storage** with AES-256-CBC encryption
- **Automatic token management** with expiration handling and refresh mechanisms
- **Random chatter selection** from Twitch chat
- **Health check endpoint** for monitoring
- **Dynamic version display** from package.json
- **Environment variable configuration** for secure setup
- **Ready for Vercel deployment** with optimized configuration

## API Endpoints

### Core Endpoints

- `GET /` - Main endpoint with application information and current version
- `GET /health` - Health check endpoint with server uptime

### Twitch Integration

- `GET /random-chatter` - Returns a random user from the broadcaster's chat

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

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```

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
  "version": "0.0.1",
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
- `npm run generateEncryptionKey` - Generate a new encryption key

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

- **0.0.1** - Initial release with OAuth 2.0 device flow, secure token storage, and random chatter API
