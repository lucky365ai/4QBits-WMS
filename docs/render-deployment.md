# Render Deployment Guide

## Quick Setup

This project is configured for easy deployment on Render using the `render.yaml` file.

### 1. Fork/Clone Repository
```bash
git clone <your-repository-url>
cd workshop-management-system
```

### 2. Deploy to Render

#### Option A: Using render.yaml (Recommended)
1. Connect your GitHub repository to Render
2. Create a new "Blueprint" deployment
3. Select your repository and the `render.yaml` file
4. Render will automatically create:
   - Backend web service
   - Frontend static site
   - PostgreSQL database

#### Option B: Manual Setup
1. Create a new Web Service for backend
2. Create a new Static Site for frontend
3. Create a PostgreSQL database
4. Configure environment variables manually

### 3. Required Environment Variables

The following environment variables are automatically configured in `render.yaml`:

#### Backend Service
- `NODE_ENV=production`
- `PORT=5000`
- `DATABASE_URL` (from database connection)
- `JWT_SECRET` (auto-generated)
- `JWT_EXPIRES_IN=7d`
- `FRONTEND_URL=https://wms-frontend.onrender.com`
- `CORS_ORIGIN=https://wms-frontend.onrender.com`
- `BCRYPT_ROUNDS=12`
- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX_REQUESTS=100`
- `MAX_FILE_SIZE=10485760`
- `EMAIL_ENABLED=false`

#### Frontend Service
- `VITE_API_URL=https://wms-backend.onrender.com`

### 4. Update Service URLs

After deployment, update the URLs in `render.yaml` to match your actual Render service URLs:

1. Replace `wms-backend.onrender.com` with your backend service URL
2. Replace `wms-frontend.onrender.com` with your frontend service URL
3. Commit and push changes to trigger redeployment

### 5. Database Setup

The database will be automatically created and connected. The application will:
1. Run Prisma migrations on startup
2. Generate Prisma client
3. Seed initial data (admin user)

### 6. Access Your Application

- **Frontend**: `https://your-frontend-service.onrender.com`
- **Backend API**: `https://your-backend-service.onrender.com`
- **Admin Login**: 
  - Email: `admin@wms.com`
  - Password: `admin123`

## Manual Environment Variable Setup

If you need to set environment variables manually in Render:

1. Go to your service dashboard
2. Click on "Environment"
3. Add the following variables:

```
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-url.onrender.com
DATABASE_URL=postgresql://username:password@host:port/database
```

## Troubleshooting

### Common Issues

1. **Missing JWT_SECRET Error**
   - Ensure `JWT_SECRET` is set in environment variables
   - Use a strong, random string (32+ characters)

2. **Database Connection Failed**
   - Check if PostgreSQL add-on is properly connected
   - Verify `DATABASE_URL` format

3. **CORS Errors**
   - Update `CORS_ORIGIN` to match your frontend URL
   - Ensure `FRONTEND_URL` is correctly set

4. **Build Failures**
   - Check build logs for specific errors
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

### Health Check

Test your deployment:
```bash
# Check backend health
curl https://your-backend-service.onrender.com/health

# Check API endpoints
curl https://your-backend-service.onrender.com/api/workshops
```

## Security Notes

- Change the default admin password after first login
- The `JWT_SECRET` should be a strong, random string
- Consider enabling additional security features for production use
- Monitor your application logs regularly

## Performance Considerations

- Render free tier has limitations (sleeps after 15 minutes of inactivity)
- Consider upgrading to paid plans for production use
- Database connections are limited on free tier
- Static assets are served via CDN automatically

## Scaling

For production workloads:
1. Upgrade to paid Render plans
2. Consider using external database services
3. Implement Redis for session storage
4. Add monitoring and alerting