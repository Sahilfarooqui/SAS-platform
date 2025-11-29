# Technical Specifications - SAS App

## 1. System Architecture

The SAS (Social Automation System) App is a web application designed to manage and automate social media posts.

### 1.1 Components
- **Frontend**: React.js application (Single Page Application).
  - Hosted on: Client Browser.
  - Communicates with Backend via REST API.
- **Backend**: Node.js (Express) server.
  - Runtime: Node.js v22+.
  - Database: SQLite (via Prisma ORM).
  - Authentication: Passport.js (Local, Facebook, Twitter, Instagram).
  - External APIs: Ayrshare (for social media posting).

### 1.2 Data Flow
1.  **User Action**: User logs in or registers on Frontend.
2.  **Authentication**: Frontend sends credentials to Backend (`/login` or `/register`). Backend validates and establishes a session (cookie-based).
3.  **Post Creation**: User submits a post. Frontend sends POST request to `/api/post`.
4.  **Processing**: 
    - **Immediate**: Backend calls Ayrshare API to post immediately.
    - **Scheduled**: Backend saves post to DB with `pending` status. A background job (setInterval) checks for due posts and publishes them.
5.  **Monitoring**: Frontend polls `/api/posts` or `/post-monitoring` (to be implemented/verified) to show status.

## 2. Key Features & Implementation Details

### 2.1 Authentication
- **Local Auth**: Email/Password using `passport-local` and `bcryptjs`.
- **Social Auth**: OAuth2 using `passport-facebook`, `passport-twitter`, `passport-instagram`.
- **Session Management**: `express-session` with encrypted cookies.

### 2.2 Database Schema (Prisma)
- **User**: Stores user profile, encrypted tokens, and Ayrshare profile key.
- **ScheduledPost**: Stores post content, media URLs, schedule time, status, and engagement metrics.

### 2.3 API Endpoints
- `POST /register`: Create new user.
- `POST /login`: Authenticate user.
- `POST /api/post`: Create/Schedule a post.
- `GET /api/posts`: List user's posts.
- `GET /api/connected-accounts`: Check connected social platforms.
- `GET /auth/[provider]`: Initiate Social OAuth.

## 3. Security Measures
- **Token Encryption**: Social tokens are encrypted at rest using AES (via `crypto-js`).
- **Password Hashing**: User passwords hashed with `bcrypt`.
- **CORS**: Configured to allow requests from Frontend origin.

## 4. Deployment Requirements
- Node.js Environment.
- Environment Variables:
  - `DATABASE_URL`
  - `AYRSHARE_API_KEY`
  - `ENCRYPTION_KEY`
  - `FACEBOOK_APP_ID` / `SECRET`
  - `TWITTER_CONSUMER_KEY` / `SECRET`
  - `INSTAGRAM_CLIENT_ID` / `SECRET`
  - `BASE_URL`
