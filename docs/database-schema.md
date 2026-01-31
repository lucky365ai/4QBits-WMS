# Database Schema

## Entity Relationship Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Users    │    │  Workshops  │    │ Categories  │
│             │    │             │    │             │
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ email       │◄──┐│ title       │┌──►│ name        │
│ password    │   ││ description ││   │ slug        │
│ role        │   ││ category_id │┘   │ created_at  │
│ name        │   ││ speaker_id  │    └─────────────┘
│ created_at  │   ││ price       │
└─────────────┘   ││ max_seats   │
                  ││ start_date  │
┌─────────────┐   ││ end_date    │
│Registrations│   ││ status      │
│             │   ││ created_at  │
│ id (PK)     │   │└─────────────┘
│ user_id     │───┘
│ workshop_id │────┘
│ payment_id  │
│ status      │    ┌─────────────┐
│ created_at  │    │  Sessions   │
└─────────────┘    │             │
                   │ id (PK)     │
┌─────────────┐    │ workshop_id │───┐
│  Payments   │    │ title       │   │
│             │    │ date        │   │
│ id (PK)     │◄───│ start_time  │   │
│ amount      │    │ end_time    │   │
│ status      │    │ qr_code     │   │
│ gateway_id  │    │ created_at  │   │
│ created_at  │    └─────────────┘   │
└─────────────┘                      │
                   ┌─────────────┐   │
┌─────────────┐    │ Attendance  │   │
│Certificates │    │             │   │
│             │    │ id (PK)     │   │
│ id (PK)     │    │ user_id     │───┼─┐
│ user_id     │────│ session_id  │───┘ │
│ workshop_id │    │ marked_at   │     │
│ cert_number │    │ qr_verified │     │
│ issued_at   │    └─────────────┘     │
│ qr_code     │                        │
└─────────────┘    ┌─────────────┐     │
                   │  Feedback   │     │
┌─────────────┐    │             │     │
│   Files     │    │ id (PK)     │     │
│             │    │ user_id     │─────┘
│ id (PK)     │    │ workshop_id │
│ workshop_id │    │ rating      │
│ filename    │    │ comment     │
│ filepath    │    │ created_at  │
│ type        │    └─────────────┘
│ uploaded_by │
│ created_at  │    ┌─────────────┐
└─────────────┘    │ Audit_Logs  │
                   │             │
                   │ id (PK)     │
                   │ user_id     │
                   │ action      │
                   │ entity_type │
                   │ entity_id   │
                   │ details     │
                   │ created_at  │
                   └─────────────┘
```

## Table Definitions

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'speaker', 'student', 'guest_speaker')),
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    profile_image VARCHAR(255),
    social_links JSONB,
    expertise TEXT[],
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE, -- For guest speakers
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Categories Table
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Workshops Table
```sql
CREATE TABLE workshops (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    speaker_id INTEGER REFERENCES users(id),
    price DECIMAL(10,2) DEFAULT 0,
    max_seats INTEGER,
    current_registrations INTEGER DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    banner_image VARCHAR(255),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
    tags TEXT[],
    requirements TEXT,
    learning_outcomes TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    workshop_id INTEGER REFERENCES workshops(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    qr_code VARCHAR(255) UNIQUE,
    qr_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Registrations Table
```sql
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    workshop_id INTEGER REFERENCES workshops(id),
    payment_id INTEGER REFERENCES payments(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, workshop_id)
);
```

### Payments Table
```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    workshop_id INTEGER REFERENCES workshops(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    gateway_transaction_id VARCHAR(255),
    gateway_name VARCHAR(50),
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);
```

### Attendance Table
```sql
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_id INTEGER REFERENCES sessions(id),
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    qr_verified BOOLEAN DEFAULT TRUE,
    ip_address INET,
    UNIQUE(user_id, session_id)
);
```

### Certificates Table
```sql
CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    workshop_id INTEGER REFERENCES workshops(id),
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pdf_path VARCHAR(255),
    is_valid BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, workshop_id)
);
```

### Feedback Table
```sql
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    workshop_id INTEGER REFERENCES workshops(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, workshop_id)
);
```

### Files Table
```sql
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    workshop_id INTEGER REFERENCES workshops(id),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    uploaded_by INTEGER REFERENCES users(id),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes for Performance

```sql
-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Workshop indexes
CREATE INDEX idx_workshops_speaker ON workshops(speaker_id);
CREATE INDEX idx_workshops_category ON workshops(category_id);
CREATE INDEX idx_workshops_status ON workshops(status);
CREATE INDEX idx_workshops_dates ON workshops(start_date, end_date);

-- Registration indexes
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_registrations_workshop ON registrations(workshop_id);

-- Session indexes
CREATE INDEX idx_sessions_workshop ON sessions(workshop_id);
CREATE INDEX idx_sessions_date ON sessions(session_date);

-- Attendance indexes
CREATE INDEX idx_attendance_user_session ON attendance(user_id, session_id);

-- Audit log indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

## Initial Data Seeds

```sql
-- Default admin user
INSERT INTO users (email, password_hash, role, name, is_verified, is_approved) 
VALUES ('admin@wms.com', '$2b$10$hash', 'admin', 'System Administrator', TRUE, TRUE);

-- Default categories
INSERT INTO categories (name, slug, description) VALUES
('Technology', 'technology', 'Programming, AI, Web Development'),
('Business', 'business', 'Entrepreneurship, Marketing, Finance'),
('Design', 'design', 'UI/UX, Graphic Design, Product Design'),
('Personal Development', 'personal-development', 'Leadership, Communication, Skills');
```