# System Architecture

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ - Public Pages  │    │ - Authentication│    │ - User Data     │
│ - Role Dashboards│    │ - Workshop CRUD │    │ - Workshop Data │
│ - Auth Pages    │    │ - Payment API   │    │ - Transactions  │
│ - Marketplace   │    │ - File Upload   │    │ - Certificates  │
└─────────────────┘    │ - QR Generation │    │ - Attendance    │
                       │ - PDF Creation  │    └─────────────────┘
                       └─────────────────┘
                              │
                       ┌─────────────────┐
                       │   External      │
                       │   Services      │
                       │                 │
                       │ - Payment Gateway│
                       │ - Email Service │
                       │ - File Storage  │
                       └─────────────────┘
```

## Authentication Flow

### 1. Admin Authentication (Hidden)
```
User → /admin/login (hidden URL) → Validate credentials → JWT Token → Admin Dashboard
```

### 2. Speaker Authentication
```
User → /speaker/login → Email/Password → JWT Token → Speaker Dashboard
User → /speaker/signup → Registration → Email Verification → Login
```

### 3. Student Authentication
```
User → /student/login → Email/Password → JWT Token → Student Dashboard
User → /student/signup → Registration → Email Verification → Login
```

### 4. Guest Speaker Application
```
User → /apply-speaker → Application Form → Admin Approval → Speaker Account
```

## Role-Based Access Control (RBAC)

### Admin Permissions
- Full system access
- Workshop CRUD operations
- User management
- Analytics access
- Certificate control
- System configuration

### Speaker Permissions
- View assigned workshops
- Manage workshop content
- Upload resources
- View participants
- Access feedback

### Student Permissions
- Browse workshops
- Register & pay
- View registrations
- Download certificates
- Submit feedback

### Guest Speaker Permissions
- Submit application
- View application status

## Security Architecture

### Authentication & Authorization
```
Request → JWT Validation → Role Check → Route Access → Response
```

### Data Protection
- Password hashing (bcrypt)
- JWT token expiration
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection

### Audit Trail
- All admin actions logged
- User activity tracking
- Payment transaction logs
- Certificate generation logs

## Scalability Considerations

### Database Optimization
- Indexed queries
- Connection pooling
- Query optimization
- Database partitioning (future)

### Caching Strategy
- Redis for session storage
- API response caching
- Static file caching
- Database query caching

### Performance
- Code splitting (frontend)
- Lazy loading
- Image optimization
- CDN integration (future)
- Load balancing (future)

## Deployment Architecture

### Development Environment
```
Local Development → Docker Compose → PostgreSQL + Redis + Node.js + React
```

### Production Environment
```
Load Balancer → Application Servers → Database Cluster → File Storage
```

### CI/CD Pipeline
```
Git Push → Build → Test → Deploy to Staging → Manual Approval → Deploy to Production
```