# The "Zero-Cost" Deployment Guide

Since Render's "Blueprint" automation is trying to charge you, we will switch to the **Manual Hybrid Stack**. This uses the best free tier from each provider.

**The Stack:**
1.  **Database**: **Neon.tech** (Best Free Postgres, no sleeping, no credit card).
2.  **Backend**: **Render** (Free Web Service, manual setup).
3.  **Frontend**: **Vercel** (Best Free Frontend Hosting).

---

## Step 1: Get a Free Database (Neon.tech)
1.  Go to [neon.tech](https://neon.tech) and Sign Up (GitHub login).
2.  Create a **New Project** (e.g., `wms-db`).
3.  Copy the **Connection String** (It looks like `postgres://user:pass@ep-xyz.aws.neon.tech/neondb...`).
    *   *Keep this safe, you'll need it for the Backend.*

## Step 2: Deploy Backend (Render)
1.  Go to [dashboard.render.com](https://dashboard.render.com).
2.  Click **New +** -> **Web Service** (NOT Blueprint).
3.  Connect your GitHub repo (`lucky365ai/4QBits-WMS`).
4.  **Settings**:
    *   **Name**: `wms-backend`
    *   **Root Directory**: `backend`
    *   **Environment**: `Node`
    *   **Build Command**: `npm install && npm run db:generate && npm run build`
    *   **Start Command**: `npm run start:prod`
    *   **Instance Type**: **Free** (Scroll down to find the specific Free tier button/option).
5.  **Environment Variables** (Click "Advanced" or "Environment"):
    *   `DATABASE_URL`: *Paste your Neon Connection String from Step 1*
    *   `JWT_SECRET`: `some-random-secret-text`
    *   `NODE_ENV`: `production`
6.  Click **Create Web Service**.
7.  **Wait**: Once deployed, copy the **Service URL** (e.g., `https://wms-backend-xyz.onrender.com`).

## Step 3: Deploy Frontend (Vercel)
1.  Go to [tool.vercel.app](https://vercel.com) and Sign Up/Login.
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repo (`lucky365ai/4QBits-WMS`).
4.  **Configure Project**:
    *   **Framework Preset**: Vite (should be auto-detected).
    *   **Root Directory**: Click "Edit" and select `frontend`.
5.  **Environment Variables**:
    *   Key: `VITE_API_URL`
    *   Value: *Paste your Render Backend URL from Step 2*
6.  Click **Deploy**.

## Summary
- **Database**: Hosted on Neon (Free).
- **Backend**: Hosted on Render (Free).
- **Frontend**: Hosted on Vercel (Free).
- **Cost**: $0.00 forever.
