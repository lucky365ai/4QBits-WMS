# Workshop Management System (WMS) - Production Ready

A comprehensive, production-ready workshop management platform.

## 🚀 Key Features

### 🎯 **Core Functionality**
- ✅ **Multi-Role Authentication** (Admin, Speaker, Student, Guest Speaker)
- ✅ **Workshop Management** (Create, Edit, Publish)
- ✅ **Waitlist System** (Auto-queue when full)
- ✅ **Calendar Integration** (Add to calendar via .ics)
- ✅ **QR-Based Attendance** (Secure, time-limited codes)
- ✅ **Digital Certificates** (PDF Generation & Verification)
- ✅ **Payment Integration** (Stripe-ready)

### 📊 **Analytics & Reporting**
- **Admin Dashboard:** Revenue trends, user engagement, top workshops.
- **Audit Logs:** Full system activity tracking.
- **Export Data:** CSV export for users and registrations.

### 🔒 **Security**
- **Authentication:** JWT-based, bcrypt hashing.
- **Protection:** Helmet, Rate Limiting, CORS.
- **Audit:** Comprehensive logging of all critical actions.

## 🛠️ **Tech Stack**
- **Frontend:** React 18, Vite, Tailwind CSS, Recharts, Framer Motion.
- **Backend:** Node.js, Express, Prisma (SQLite/PostgreSQL), PDFKit.
- **Testing:** Jest, Supertest.

## 🚀 **Getting Started**

### 1. Installation
```bash
# Backend
cd backend
npm install
npm run db:setup

# Frontend
cd frontend
npm install
```

### 2. Running Tests
```bash
cd backend
npm test
```

### 3. Start Application
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## 📝 **API Documentation**

### **Analytics**
- `GET /api/admin/analytics/dashboard` - Overview stats
- `GET /api/admin/analytics/revenue` - Revenue reports
- `GET /api/admin/analytics/engagement` - User engagement reports
- `GET /api/admin/audit-logs` - System audit logs

### **Certificates**
- `GET /api/certificates/my-certificates` - List user certificates
- `GET /api/certificates/:id/download` - Download PDF certificate

### **Attendance**
- `POST /api/workshops/sessions/:id/qr` - Generate QR code (Speaker)
- `POST /api/workshops/attendance/:qrCode` - Mark attendance (Student)

---
**Status**: ✅ Production Ready
**Version**: 1.1.0
