# TwitchWrapper

A Node.js wrapper for the Twitch API, designed to simplify integration and provide easy access to Twitch data. This Express.js server is designed for deployment on Vercel and provides a clean API interface for Twitch integration.

## Features

- Express.js server with CORS support
- Twitch API wrapper functionality
- Environment variable configuration
- Health check endpoint
- Dynamic version display from package.json
- Example endpoints demonstrating HTTP requests
- Error handling middleware
- Ready for Vercel deployment

## Endpoints

- `GET /` - Main endpoint with basic information and current version
- `GET /health` - Health check endpoint

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your environment variables (see `.env.example`)

3. Run locally:
```bash
npm run dev
```

## Deployment

This project is configured for Vercel deployment. Simply connect your repository to Vercel or use the Vercel CLI:

```bash
vercel
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- Add your custom environment variables in the `.env` file

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Project Structure

```text
├── index.js          # Main server file
├── package.json      # Dependencies and scripts
├── vercel.json       # Vercel deployment configuration
├── .env             # Environment variables (not committed)
├── .gitignore       # Git ignore rules
└── README.md        # This file
```
