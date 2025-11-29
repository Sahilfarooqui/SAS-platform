# SAS App User Documentation

Welcome to the SAS App! This documentation will guide you through setting up, configuring, and monitoring your social media workflows.

## Table of Contents

1.  [Getting Started](#getting-started)
2.  [Account Registration & Login](#account-registration--login)
3.  [Connecting Social Media Accounts](#connecting-social-media-accounts)
4.  [Composing and Publishing Posts](#composing-and-publishing-posts)
    *   [Immediate Posts](#immediate-posts)
    *   [Scheduled Posts](#scheduled-posts)
5.  [Monitoring Post Performance](#monitoring-post-performance)
6.  [Troubleshooting](#troubleshooting)

## 1. Getting Started

To begin using the SAS App, ensure you have the following prerequisites installed:

*   Node.js (LTS version recommended)
*   npm (Node Package Manager)

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd sas-app
    ```

2.  **Install backend dependencies:**
    ```bash
    cd backend-nodejs
    npm install
    ```

3.  **Install frontend dependencies:**
    ```bash
    cd ../frontend
    npm install
    ```

4.  **Set up environment variables:**
    Create a `.env` file in the `backend-nodejs` directory with the necessary API keys and secrets for your social media platforms. (e.g., `FACEBOOK_APP_ID=your_id`, `FACEBOOK_APP_SECRET=your_secret`)

5.  **Run the application:**
    *   **Start the backend:**
        ```bash
        cd backend-nodejs
        node index.js
        ```
    *   **Start the frontend:**
        ```bash
        cd ../frontend
        npm start
        ```

    The application should now be running on `http://localhost:3000`.

## 2. Account Registration & Login

1.  Open the application in your browser.
2.  Click on **Register** to create a new account. Provide your name, email, and password.
3.  After registration, log in with your credentials to access the dashboard.

## 3. Connecting Social Media Accounts

Navigate to the "Connect Social Media" section. You can link your Facebook, Twitter, and Instagram accounts using the respective buttons. This will redirect you to the platform's OAuth page to authorize the SAS App.

## 4. Composing and Publishing Posts

### Immediate Posts

1.  Go to the "Create Post" (Home) page.
2.  Enter your content, image URL, and link.
3.  Click "Publish Now / Schedule Post". If no date is selected, it posts immediately.

### Scheduled Posts

1.  Follow the steps for Immediate Posts.
2.  Select a **Date** and **Time** for the post.
3.  Click "Publish Now / Schedule Post". The post will be saved and published automatically at the scheduled time.

## 5. Monitoring Post Performance

Navigate to the "Post Monitoring" or "Analytics" section.
- **Analytics**: View a list of all your posts with their status (Published, Pending, Failed) and engagement metrics.
- **Post Monitoring**: View summary statistics like total posts, delivery success rates, and aggregate engagement.

## 6. Troubleshooting

### 6.1 Checking Backend Status

*   Monitor the console output of the `node index.js` command for any errors or logs.

### 6.2 Checking Frontend Status

*   Monitor the console output of the `npm start` command for any errors or warnings.
*   Check your browser's developer console for frontend-related errors.

### 6.3 Common Issues

*   **`OAuth2Strategy requires a clientID option`**: Ensure your `.env` file is correctly configured with all client IDs and secrets, and that the backend server has been restarted after modifying `.env`.
*   **Frontend not loading**: Verify that both the backend and frontend servers are running. Check for port conflicts.
*   **Login Failed**: Ensure you have registered an account first. If using social login, ensure the app is authorized.