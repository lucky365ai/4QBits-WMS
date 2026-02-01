# Free Deployment Guide (Render.com)

**Your project is now fully configured for Render's Free Tier.**
I have already fixed your code to support this automatically.

## Deployment Steps

1.  **Push to GitHub repository**:
    Run these commands in your project folder to save your changes and upload them to GitHub:
    ```bash
    git add .
    git commit -m "Ready for deployment"
    git push origin main
    ```

2.  **Create Account on Render**:
    Go to [render.com](https://render.com) and sign up (login with GitHub is easiest).

3.  **Create Blueprint (The Automatic Way)**:
    - In the Render Dashboard, click the **"New +"** button.
    - Select **"Blueprint"**.
    - Connect your GitHub repository.
    - Give it a name (e.g., `my-wms-app`).
    - Click **"Apply Blueprint"**.

4.  **Wait & Enjoy**:
    - Render will automatically create a database and two web services (Frontend + Backend) for you.
    - Wait about 5-10 minutes for the first build.
    - Once done, click the **Frontend URL** to see your live app!

## Why this is free?
- **Database**: Uses Render's Free Postgres (expires after 30 days, good for demos).
- **Backend**: Uses Render's Free Web Service (spins down on inactivity).
- **Frontend**: Uses Render's Free Static Site (always on).
