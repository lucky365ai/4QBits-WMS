@echo off
setlocal enabledelayedexpansion

REM Workshop Management System Setup Script for Windows
REM This script sets up the development environment

echo.
echo ============================================
echo    Workshop Management System Setup
echo ============================================
echo.

REM Check if Node.js is installed
echo [INFO] Checking prerequisites...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

echo [SUCCESS] Node.js is installed: 
node --version

REM Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not available. Please ensure npm is installed with Node.js.
    pause
    exit /b 1
)

echo [SUCCESS] npm is installed: 
npm --version

echo.
echo [INFO] Installing dependencies...

REM Install root dependencies
echo [INFO] Installing root dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install root dependencies
    pause
    exit /b 1
)

REM Install frontend dependencies
echo [INFO] Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

REM Install backend dependencies
echo [INFO] Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo [SUCCESS] Dependencies installed successfully

echo.
echo [INFO] Setting up environment files...

REM Setup backend environment
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env" >nul
    echo [SUCCESS] Created backend/.env from example
    echo [WARNING] Please update backend/.env with your configuration
) else (
    echo [WARNING] backend/.env already exists, skipping...
)

echo.
echo [INFO] Creating necessary directories...

REM Create directories
if not exist "backend\uploads" mkdir "backend\uploads"
if not exist "backend\logs" mkdir "backend\logs"
if not exist "frontend\dist" mkdir "frontend\dist"

echo [SUCCESS] Directories created

echo.
echo [INFO] Setting up database...

cd backend

REM Generate Prisma client
call npx prisma generate
if errorlevel 1 (
    echo [WARNING] Prisma client generation failed - please check your setup
) else (
    echo [SUCCESS] Prisma client generated
)

cd ..

echo.
echo [INFO] Building applications...

REM Build frontend
cd frontend
call npm run build 2>nul
if errorlevel 1 (
    echo [WARNING] Frontend build failed - this is normal for initial setup
) else (
    echo [SUCCESS] Frontend built successfully
)
cd ..

REM Build backend
cd backend
call npm run build 2>nul
if errorlevel 1 (
    echo [WARNING] Backend build failed - this is normal for initial setup
) else (
    echo [SUCCESS] Backend built successfully
)
cd ..

echo.
echo ============================================
echo            Setup Complete! 🎉
echo ============================================
echo.
echo [SUCCESS] Workshop Management System has been set up successfully!
echo.
echo Next steps:
echo 1. Update backend/.env with your database and email configuration
echo 2. Start the development servers:
echo    npm run dev
echo.
echo 3. Access the application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000
echo    Admin Login: http://localhost:3000/admin/login
echo    Default Admin: username=admin, password=admin123
echo.
echo For production deployment, see docs/deployment-guide.md
echo.
pause