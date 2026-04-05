# SAS Platform — Social Automation & Scheduling

A full-stack platform to schedule and publish posts to social media (Facebook, Twitter, Instagram) with analytics and monitoring.

## Project Structure

- `frontend/` — React application (Create React App)
- `backend-nodejs/` — Node.js/Express API server with Prisma + SQLite
- `docker-compose.yml` — One-command Docker deployment
- `deploy.sh` — Deploy with Docker Compose
- `start.sh` — Run locally without Docker

## Quick Start

### Option A: Docker (Recommended)

```bash
# 1. Copy and edit env vars
cp backend-nodejs/.env.example backend-nodejs/.env
# Edit backend-nodejs/.env with your API keys

# 2. Deploy
./deploy.sh
```

App runs at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Option B: Local Development (No Docker)

**Prerequisites:** Node.js v18+

```bash
# 1. Copy and edit env vars
cp backend-nodejs/.env.example backend-nodejs/.env

# 2. Start everything
./start.sh
```

Or manually:

```bash
# Backend
cd backend-nodejs
npm install
npx prisma migrate deploy
node index.js        # runs on :5000

# Frontend (new terminal)
cd frontend
npm install
REACT_APP_API_URL=http://localhost:5000 npm start  # runs on :3000
```

## Environment Variables

Copy `backend-nodejs/.env.example` to `backend-nodejs/.env` and fill in:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite path, e.g. `file:./prisma/dev.db` |
| `SESSION_SECRET` | Yes | Long random string for session signing |
| `ENCRYPTION_KEY` | Yes | 32-char key for encrypting OAuth tokens |
| `AYRSHARE_API_KEY` | Optional | For posting to social media |
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` | Optional | Facebook OAuth |
| `TWITTER_CONSUMER_KEY` / `TWITTER_CONSUMER_SECRET` | Optional | Twitter OAuth |
| `INSTAGRAM_CLIENT_ID` / `INSTAGRAM_CLIENT_SECRET` | Optional | Instagram OAuth |

> **Note**: The app works without social media API keys — you can register, log in, and schedule posts (they'll fail to publish without valid keys).

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Create account |
| POST | `/login` | No | Log in |
| POST | `/logout` | No | Log out |
| GET | `/api/me` | Yes | Get current user |
| GET | `/health` | No | Health check |
| POST | `/api/post` | Yes | Create/schedule post |
| GET | `/api/posts` | Yes | List posts |
| GET | `/api/connected-accounts` | Yes | Check social connections |
| GET | `/api/analytics/status` | Yes | Post status summary |
| GET | `/api/analytics/delivery` | Yes | Delivery status summary |
| GET | `/api/analytics/engagement` | Yes | Engagement metrics |

## Frontend Routes

| Path | Description |
|---|---|
| `/` | Create/Schedule Post |
| `/register` | Register |
| `/login` | Login |
| `/analytics` | Post list table |
| `/analytics-dashboard` | Charts & visual analytics |
| `/connect-social` | Connect OAuth accounts |
| `/post-monitoring` | Post delivery metrics |

## Running Tests

```bash
cd backend-nodejs
npm test
```

## Troubleshooting

- **Port in use**: Change `PORT` env var in `backend-nodejs/.env`, or use `PORT=5001 node index.js`
- **DB issues**: Delete `backend-nodejs/prisma/dev.db` and re-run migrations
- **Docker**: Run `docker-compose logs backend` or `docker-compose logs frontend` for details
