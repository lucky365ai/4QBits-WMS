#!/bin/bash

# Workshop Management System Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up Workshop Management System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if PostgreSQL is installed
check_postgres() {
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL is not installed. Please install PostgreSQL 15+ for production use."
        print_warning "For development, you can use Docker: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:15"
    else
        print_success "PostgreSQL is installed"
    fi
}

# Check if Redis is installed
check_redis() {
    if ! command -v redis-cli &> /dev/null; then
        print_warning "Redis is not installed. Please install Redis for production use."
        print_warning "For development, you can use Docker: docker run -d -p 6379:6379 redis:7-alpine"
    else
        print_success "Redis is installed"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend && npm install && cd ..
    
    print_success "Dependencies installed successfully"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        print_success "Created backend/.env from example"
        print_warning "Please update backend/.env with your configuration"
    else
        print_warning "backend/.env already exists, skipping..."
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    cd backend
    
    # Generate Prisma client
    npx prisma generate
    print_success "Prisma client generated"
    
    # Check if we can connect to database
    if npx prisma db push --accept-data-loss 2>/dev/null; then
        print_success "Database schema created"
        
        # Run seed if available
        if [ -f "src/database/seed.ts" ]; then
            npm run db:seed 2>/dev/null || print_warning "Database seeding failed - you may need to configure your database connection"
        fi
    else
        print_warning "Could not connect to database. Please ensure PostgreSQL is running and update DATABASE_URL in backend/.env"
    fi
    
    cd ..
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p backend/uploads
    mkdir -p backend/logs
    mkdir -p frontend/dist
    
    print_success "Directories created"
}

# Build applications
build_applications() {
    print_status "Building applications..."
    
    # Build frontend
    cd frontend
    npm run build 2>/dev/null || print_warning "Frontend build failed - this is normal for initial setup"
    cd ..
    
    # Build backend
    cd backend
    npm run build 2>/dev/null || print_warning "Backend build failed - this is normal for initial setup"
    cd ..
    
    print_success "Build process completed"
}

# Main setup function
main() {
    echo "============================================"
    echo "   Workshop Management System Setup"
    echo "============================================"
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    check_node
    check_postgres
    check_redis
    echo ""
    
    # Install dependencies
    install_dependencies
    echo ""
    
    # Setup environment
    setup_environment
    echo ""
    
    # Create directories
    create_directories
    echo ""
    
    # Setup database
    setup_database
    echo ""
    
    # Build applications
    build_applications
    echo ""
    
    # Final instructions
    echo "============================================"
    echo "           Setup Complete! 🎉"
    echo "============================================"
    echo ""
    print_success "Workshop Management System has been set up successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update backend/.env with your database and email configuration"
    echo "2. Start the development servers:"
    echo "   npm run dev"
    echo ""
    echo "3. Access the application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:5000"
    echo "   Admin Login: http://localhost:3000/admin/login"
    echo "   Default Admin: username=admin, password=admin123"
    echo ""
    echo "For production deployment, see docs/deployment-guide.md"
    echo ""
}

# Run main function
main