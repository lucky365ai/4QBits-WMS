# Deployment Guide

## Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 15+
- Redis 7+
- Docker and Docker Compose (optional)

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd workshop-management-system
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Environment Configuration

#### Backend Environment (.env)
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/wms_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="production"

# Redis
REDIS_URL="redis://localhost:6379"

# Email (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@yourdomain.com"

# Payment (Stripe)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Frontend URL
FRONTEND_URL="https://yourdomain.com"

# Admin Credentials
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="secure-admin-password"
```

## Database Setup

### 1. Create Database
```sql
CREATE DATABASE wms_db;
CREATE USER wms_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE wms_db TO wms_user;
```

### 2. Run Migrations
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 3. Seed Initial Data
```bash
npm run db:seed
```

## Docker Deployment

### 1. Development with Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Production with Docker
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

## Manual Deployment

### 1. Build Applications
```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd ../backend
npm run build
```

### 2. Start Services

#### Backend
```bash
cd backend
npm start
```

#### Frontend (with Nginx)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL Configuration

### 1. Obtain SSL Certificate
```bash
# Using Certbot (Let's Encrypt)
sudo certbot --nginx -d yourdomain.com
```

### 2. Update Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Rest of configuration...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Process Management

### 1. Using PM2
```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start npm --name "wms-backend" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### 2. PM2 Ecosystem File
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'wms-backend',
    script: 'dist/server.js',
    cwd: './backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

Start with:
```bash
pm2 start ecosystem.config.js
```

## Monitoring and Logging

### 1. Application Logs
```bash
# View PM2 logs
pm2 logs

# View specific app logs
pm2 logs wms-backend

# Monitor in real-time
pm2 monit
```

### 2. System Monitoring
```bash
# Install monitoring tools
npm install -g @pm2/pm2-server-monit

# Setup monitoring
pm2 install pm2-server-monit
```

## Backup Strategy

### 1. Database Backup
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U wms_user wms_db > backup_$DATE.sql
```

### 2. File Backup
```bash
# Backup uploads directory
tar -czf uploads_backup_$DATE.tar.gz uploads/
```

### 3. Automated Backups
Add to crontab:
```bash
# Daily database backup at 2 AM
0 2 * * * /path/to/backup_script.sh

# Weekly file backup on Sundays at 3 AM
0 3 * * 0 /path/to/file_backup_script.sh
```

## Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT secret
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure firewall (allow only 80, 443, 22)
- [ ] Set up fail2ban for SSH protection
- [ ] Regular security updates
- [ ] Database access restrictions
- [ ] Environment variables secured
- [ ] File upload restrictions configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured

## Performance Optimization

### 1. Database Optimization
- Enable connection pooling
- Add database indexes
- Regular VACUUM and ANALYZE
- Monitor slow queries

### 2. Caching
- Redis for session storage
- API response caching
- Static file caching with CDN

### 3. Frontend Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement service worker for caching
- Optimize images and assets

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check firewall settings

2. **Redis Connection Failed**
   - Verify Redis is running
   - Check REDIS_URL configuration
   - Check network connectivity

3. **Email Not Sending**
   - Verify SMTP credentials
   - Check email provider settings
   - Test with email testing tools

4. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Check disk space

### Health Checks
```bash
# Check application health
curl http://localhost:5000/health

# Check database connection
psql -h localhost -U wms_user -d wms_db -c "SELECT 1;"

# Check Redis connection
redis-cli ping
```

## Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Database read replicas
- Redis clustering
- CDN integration

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching strategies
- Monitor resource usage