# Render Environment Variables Setup

If the automatic `render.yaml` deployment doesn't work, you can manually set environment variables in Render:

## Backend Service Environment Variables

Go to your Render backend service dashboard → Environment tab and add these variables:

### Required Variables
```
NODE_ENV=production
PORT=5000
DATABASE_URL=[automatically set by Render database]
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-service.onrender.com
```

### Optional Variables (for enhanced functionality)
```
CORS_ORIGIN=https://your-frontend-service.onrender.com
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
EMAIL_ENABLED=false
```

## Generate Secure JWT_SECRET

Use one of these methods to generate a secure JWT_SECRET:

### Method 1: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Method 2: OpenSSL
```bash
openssl rand -hex 64
```

### Method 3: Online Generator
Visit: https://generate-secret.vercel.app/64

## Frontend Service Environment Variables

For your frontend static site, add:

```
VITE_API_URL=https://your-backend-service.onrender.com
```

## Step-by-Step Manual Setup

1. **Create PostgreSQL Database**
   - Go to Render Dashboard
   - Click "New" → "PostgreSQL"
   - Name: `wms-db`
   - Plan: Free
   - Create database

2. **Create Backend Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Root Directory: `backend`
   - Build Command: `npm install && npm run db:generate && npm run build`
   - Start Command: `npm run start:prod`
   - Add all environment variables listed above
   - Link the PostgreSQL database

3. **Create Frontend Static Site**
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Add frontend environment variables

4. **Update URLs**
   - After both services are created, update the URLs in environment variables
   - Backend `FRONTEND_URL` → your frontend service URL
   - Frontend `VITE_API_URL` → your backend service URL

## Troubleshooting

### JWT_SECRET Error
If you still get "Missing required environment variables: [ 'JWT_SECRET' ]":

1. Double-check the environment variable is set in Render dashboard
2. Ensure there are no typos in the variable name
3. Try redeploying the service after setting the variable
4. Check the service logs for any other missing variables

### Database Connection Issues
1. Ensure the PostgreSQL database is running
2. Check that `DATABASE_URL` is automatically set by Render
3. Verify the database and web service are in the same region

### CORS Issues
1. Make sure `CORS_ORIGIN` matches your frontend URL exactly
2. Include the protocol (https://) in the URL
3. No trailing slash in the URL