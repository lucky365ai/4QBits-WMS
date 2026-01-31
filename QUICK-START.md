# 🚀 Quick Start Guide - Localhost Setup

## ✅ Setup Complete!

Your Workshop Management System is now running on localhost with test data!

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **Admin Panel**: http://localhost:3000/admin/login

## 🔐 Test Accounts

### Admin Account
- **Email**: `admin@wms.com`
- **Password**: `admin123`
- **Access**: http://localhost:3000/admin/login

### Speaker Account
- **Email**: `speaker@wms.com`
- **Password**: `speaker123`
- **Access**: http://localhost:3000/auth/login

### Student Account
- **Email**: `student@wms.com`
- **Password**: `student123`
- **Access**: http://localhost:3000/auth/login

## 📊 Test Data Included

✅ **Users Created**:
- 1 Admin user
- 1 Speaker user (John Doe)
- 1 Student user (Jane Smith)

✅ **Categories Created**:
- Technology
- Business
- Design
- Personal Development

## 🎯 What You Can Do

### As Admin
1. Login at `/admin/login`
2. Create workshops
3. Manage users
4. View analytics
5. Check audit logs

### As Speaker
1. Login at `/auth/login`
2. View dashboard
3. Create workshops (if approved)
4. Manage your workshops
5. View registrations

### As Student
1. Login at `/auth/login`
2. Browse workshops
3. Register for workshops
4. View certificates
5. Track attendance

## 🛠️ Server Management

### Start Servers
```bash
# Start both servers
npm run dev

# Or start individually
npm run dev:backend  # Backend on port 5000
npm run dev:frontend # Frontend on port 3000
```

### Stop Servers
Press `Ctrl+C` in the terminal where servers are running

### Reset Database
```bash
cd backend
npm run db:reset    # Reset and reseed database
npm run db:seed     # Just reseed data
```

## 🐛 Troubleshooting

### Backend not starting?
- Check if port 5000 is available
- Verify database file exists: `backend/prisma/dev.db`
- Check backend logs for errors

### Frontend not starting?
- Check if port 3000 is available
- Verify node_modules are installed: `npm install`
- Check frontend logs for errors

### Database issues?
```bash
cd backend
npm run db:push    # Sync schema
npm run db:seed    # Reseed data
```

## 📝 Next Steps

1. **Explore the Application**
   - Visit http://localhost:3000
   - Try logging in with different accounts
   - Create a workshop as admin
   - Register for a workshop as student

2. **Create More Test Data**
   - Login as admin
   - Create workshops in different categories
   - Add sessions to workshops
   - Test registration flow

3. **Test Features**
   - QR code attendance
   - Certificate generation
   - Payment integration (if configured)
   - Email notifications (if configured)

## 🎨 Features to Test

- ✅ User authentication and authorization
- ✅ Workshop browsing and filtering
- ✅ Workshop registration
- ✅ QR-based attendance
- ✅ Certificate generation
- ✅ Dashboard analytics
- ✅ Admin panel features

## 📞 Need Help?

- Check the `PRODUCTION-CHECKLIST.md` for deployment info
- Review `IMPROVEMENTS-SUMMARY.md` for all improvements
- Check server logs in the terminal
- Verify environment variables are set correctly

---

**Status**: ✅ Running on Localhost
**Last Updated**: Now
**Version**: 1.0.0

Enjoy testing your Workshop Management System! 🎉
