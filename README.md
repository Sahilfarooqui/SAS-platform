# SAS APP

This project consists of a frontend React application and a backend Node.js Express server.

## Project Structure

- `frontend/`: Contains the React application.
- `backend-nodejs/`: Contains the active Node.js Express server with Prisma and Authentication.
- `backend/`: (Legacy) Old backend implementation.

## Setup and Installation

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Backend Setup

1. Navigate to the `backend-nodejs` directory:
   ```bash
   cd backend-nodejs
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize Database (if needed):
   ```bash
   npx prisma migrate dev
   ```
4. Start the backend server:
   ```bash
   node index.js
   ```
   The backend server will run on `http://localhost:5000`.

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm start
   ```
   The frontend application will run on `http://localhost:3000`.

## API Endpoints (Backend)

- `POST /register`: Register a new user.
- `POST /login`: Login.
- `POST /api/post`: Create/Schedule a post.
- `GET /api/posts`: List posts.
- `GET /api/connected-accounts`: Check social connections.
- `GET /api/analytics/status`: Post status summary.
- `GET /api/analytics/delivery`: Delivery status summary.
- `GET /api/analytics/engagement`: Engagement metrics summary.

## Frontend Routes

- `/`: Create New Post (Home)
- `/register`: User Registration
- `/login`: User Login
- `/analytics`: Post List & Status
- `/connect-social`: Connect Social Media Accounts
- `/post-monitoring`: Analytics Overview

## Workflow Monitoring

### Backend Logging

The backend uses `morgan` for HTTP request logging. You will see request details in the backend server's console output, which can help monitor traffic and identify issues.

### Frontend Monitoring

- **Post Monitoring Page**: Displays status, delivery, and engagement metrics for posts.
- **Analytics Dashboard**: Provides interactive reports and charts for post performance.

## Troubleshooting

- **Port Conflicts**: If you encounter issues with ports being in use, you can try changing the `PORT` environment variable before starting the frontend or backend servers. For example, for the frontend:
  ```bash
  set PORT=3001 && npm start
  ```
  For the backend, you can modify the `port` variable in `backend/index.js`.

- **Backend Not Responding**: Ensure the backend server is running (`node index.js` in the `backend` directory).
- **Frontend Not Displaying Data**: Check the browser console for any network errors or issues with fetching data from the backend. Ensure the backend server is accessible on `http://localhost:5000`.