@echo off
REM Workshop Management System Deployment Script for Windows

echo 🚀 Starting WMS Deployment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install root dependencies
echo 📦 Installing root dependencies...
npm install

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
npm install
cd ..

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
npm install
cd ..

REM Setup environment files
echo ⚙️ Setting up environment configuration...
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo ✅ Created backend\.env from template
    echo ⚠️  Please update backend\.env with your production values
)

REM Setup database
echo 🗄️ Setting up database...
cd backend
npm run db:generate
npm run db:push
npm run db:seed
cd ..

REM Build frontend for production
echo 🏗️ Building frontend for production...
cd frontend
npm run build
cd ..

REM Create production build
echo 📦 Creating production build...
cd backend
npm run build
cd ..

echo ✅ Deployment preparation complete!
echo.
echo 🌐 To start the production server:
echo    cd backend ^&^& npm run start
echo.
echo 📋 Default Admin Access:
echo    URL: http://localhost:5000/admin/login
echo    Username: admin
echo    Password: admin123
echo.
echo ⚠️  Remember to:
echo    1. Update backend\.env with production values
echo    2. Configure your reverse proxy (nginx/apache)
echo    3. Set up SSL certificates
echo    4. Configure your domain DNS

pause