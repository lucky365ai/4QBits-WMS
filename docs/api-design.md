# API Design Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
All API responses follow this structure:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Response data (optional)
  "error": {}, // Error details (optional)
  "pagination": {} // Pagination info (optional)
}
```

## Authentication Endpoints

### POST /auth/login
Login with email and password
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /auth/admin/login
Hidden admin login
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### POST /auth/student/register
Student registration
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

### POST /auth/speaker/register
Speaker registration
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "bio": "Experienced developer...",
  "expertise": ["JavaScript", "React"],
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/jane",
    "twitter": "https://twitter.com/jane"
  }
}
```

### POST /auth/guest-speaker/apply
Guest speaker application
```json
{
  "name": "Bob Wilson",
  "email": "bob@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "bio": "Industry expert...",
  "expertise": ["AI", "Machine Learning"],
  "motivation": "I want to share my knowledge..."
}
```

## Workshop Endpoints

### GET /workshops
Get all published workshops (public)
Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term
- `category`: Category filter
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `sortBy`: Sort field (title, price, startDate, rating)
- `sortOrder`: Sort order (asc, desc)

### GET /workshops/:id
Get workshop details (public)

### POST /workshops
Create workshop (Admin/Speaker only)
```json
{
  "title": "React Fundamentals",
  "description": "Learn React basics...",
  "categoryId": 1,
  "price": 99.99,
  "maxSeats": 50,
  "startDate": "2024-02-01",
  "endDate": "2024-02-01",
  "tags": ["react", "javascript"],
  "requirements": "Basic JavaScript knowledge",
  "learningOutcomes": ["Understand React components", "Build React apps"]
}
```

### PUT /workshops/:id
Update workshop (Admin/Speaker owner only)

### DELETE /workshops/:id
Delete workshop (Admin only)

### POST /workshops/:id/register
Register for workshop (Student only)

### POST /workshops/:id/sessions
Create workshop session (Admin/Speaker owner only)
```json
{
  "title": "Introduction to React",
  "description": "Basic concepts...",
  "sessionDate": "2024-02-01",
  "startTime": "09:00",
  "endTime": "12:00"
}
```

## User Management Endpoints

### GET /users/profile
Get current user profile (Authenticated)

### PUT /users/profile
Update user profile (Authenticated)

### GET /users/registrations
Get user's workshop registrations (Student only)

### GET /users/workshops
Get user's workshops (Speaker only)

## Admin Endpoints

### GET /admin/users
Get all users with filters (Admin only)

### PUT /admin/users/:id/approve
Approve guest speaker (Admin only)

### GET /admin/workshops
Get all workshops (Admin only)

### GET /admin/analytics
Get system analytics (Admin only)

### GET /admin/audit-logs
Get audit logs (Admin only)

## Attendance Endpoints

### POST /attendance/mark
Mark attendance with QR code (Student only)
```json
{
  "sessionId": 1,
  "qrCode": "session_qr_code_string"
}
```

### GET /attendance/session/:sessionId
Get session attendance (Admin/Speaker only)

## Certificate Endpoints

### GET /certificates
Get user's certificates (Student only)

### GET /certificates/:id/download
Download certificate PDF (Student owner only)

### GET /certificates/verify/:certificateNumber
Verify certificate (Public)

## Payment Endpoints

### POST /payments/create-intent
Create payment intent (Student only)
```json
{
  "workshopId": 1,
  "amount": 99.99
}
```

### POST /payments/webhook
Stripe webhook handler (Internal)

## File Upload Endpoints

### POST /files/upload
Upload workshop files (Speaker/Admin only)
- Multipart form data with file field

### GET /files/:id/download
Download file (Authenticated users only)

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting
- 100 requests per 15 minutes per IP
- Higher limits for authenticated users
- Separate limits for file uploads

## Pagination
List endpoints return pagination info:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```