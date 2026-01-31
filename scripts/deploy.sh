#!/bin/bash

# Workshop Management System Deployment Script

echo "🚀 Starting WMS Deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Setup environment files
echo "⚙️ Setting up environment configuration..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from template"
    echo "⚠️  Please update backend/.env with your production values"
fi

# Setup database
echo "🗄️ Setting up database..."
cd backend
npm run db:generate
npm run db:push
npm run db:seed
cd ..

# Build frontend for production
echo "🏗️ Building frontend for production..."
cd frontend
npm run build
cd ..

# Create production build
echo "📦 Creating production build..."
cd backend
npm run build
cd ..

echo "✅ Deployment preparation complete!"
echo ""
echo "🌐 To start the production server:"
echo "   cd backend && npm run start"
echo ""
echo "📋 Default Admin Access:"
echo "   URL: http://localhost:5000/admin/login"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "⚠️  Remember to:"
echo "   1. Update backend/.env with production values"
echo "   2. Configure your reverse proxy (nginx/apache)"
echo "   3. Set up SSL certificates"
echo "   4. Configure your domain DNS"