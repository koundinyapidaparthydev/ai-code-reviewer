# Codebird — Complete Setup Guide

This guide will walk you through setting up and running Codebird. The application consists of a Next.js frontend and a Node.js/Express backend with PostgreSQL database.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Testing the Setup](#testing-the-setup)
7. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

Make sure you have the following installed on your system:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Redis** (v6 or higher) - [Download](https://redis.io/download)
- **Git** - [Download](https://git-scm.com/)

### Optional but Recommended:
- **Docker** and **Docker Compose** (for easier database/Redis setup)

---

## 2. Database Setup

### Option A: Using Local PostgreSQL

1. **Start PostgreSQL service:**
   ```bash
   # macOS with Homebrew
   brew services start postgresql@14
   
   # Linux
   sudo systemctl start postgresql
   ```

2. **Create database and user:**
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Run these SQL commands:
   CREATE DATABASE ai_code_reviewer;
   CREATE USER ai_reviewer WITH ENCRYPTED PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE ai_code_reviewer TO ai_reviewer;
   \q
   ```

### Option B: Using Docker

```bash
# Create and start PostgreSQL container
docker run --name ai-code-reviewer-db \
  -e POSTGRES_DB=ai_code_reviewer \
  -e POSTGRES_USER=ai_reviewer \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  -d postgres:14
```

### Start Redis

**Option A: Local Redis**
```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis
```

**Option B: Docker**
```bash
docker run --name ai-code-reviewer-redis \
  -p 6379:6379 \
  -d redis:7-alpine
```

---

## 3. Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd ai-code-reviewer-backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `ai-code-reviewer-backend` directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DATABASE_URL="postgresql://ai_reviewer:your_secure_password@localhost:5432/ai_code_reviewer?schema=public"

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# GitHub Configuration (Optional - for GitHub OAuth)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Email Configuration (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Step 4: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npx prisma db seed
```

### Step 5: Build the Backend

```bash
npm run build
```

### Step 6: Verify Backend Setup

```bash
# Run in development mode
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
✅ Database connected
✅ Redis connected
```

---

## 4. Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd ../ai-code-reviewer-frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

The `.env.local` file should already exist with:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

If it doesn't exist, create it with the above content.

### Step 4: Build the Frontend (Optional)

```bash
npm run build
```

---

## 5. Running the Application

### Start Backend Server

**Terminal 1:**
```bash
cd ai-code-reviewer-backend
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:5000
✅ Database connected
✅ Redis connected
🔌 WebSocket server initialized
```

### Start Frontend Application

**Terminal 2:**
```bash
cd ai-code-reviewer-frontend
npm run dev
```

Expected output:
```
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   - Ready in Xms
```

---

## 6. Testing the Setup

### 1. Check Backend Health

Open your browser or use curl:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-XX...",
  "environment": "development"
}
```

### 2. Access Frontend

Open your browser and navigate to:
```
http://localhost:3000
```

### 3. Test User Registration

1. Click "Sign Up" on the frontend
2. Fill in the registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: TestPassword123!
3. Submit the form

### 4. Test Login

1. Use the credentials from step 3
2. Click "Sign In"
3. You should be redirected to the dashboard

### 5. Verify API Endpoints

Test each endpoint group:

**Auth Endpoints:**
```bash
# Health check
curl http://localhost:5000/health

# Sign up (example)
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test1234!"}'
```

**Protected Endpoints (need JWT token):**
```bash
# Get current user
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get validations
curl http://localhost:5000/api/validations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get repositories
curl http://localhost:5000/api/repositories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get notifications
curl http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get settings
curl http://localhost:5000/api/settings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 7. Troubleshooting

### Backend Issues

#### Port Already in Use
```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)
```

#### Database Connection Failed

1. **Check PostgreSQL is running:**
   ```bash
   # macOS
   brew services list | grep postgresql
   
   # Linux
   systemctl status postgresql
   ```

2. **Verify DATABASE_URL in .env:**
   - Ensure username, password, and database name are correct
   - Test connection:
     ```bash
     psql "postgresql://ai_reviewer:password@localhost:5432/ai_code_reviewer"
     ```

3. **Reset database:**
   ```bash
   npx prisma migrate reset
   npx prisma generate
   ```

#### Redis Connection Failed

1. **Check Redis is running:**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

2. **Start Redis if not running:**
   ```bash
   # macOS
   brew services start redis
   
   # Linux
   sudo systemctl start redis
   ```

#### Prisma Client Issues

If you see "Prisma Client not initialized" errors:
```bash
cd ai-code-reviewer-backend
rm -rf node_modules/.prisma
npx prisma generate
npm run build
```

### Frontend Issues

#### Module Not Found Errors

```bash
cd ai-code-reviewer-frontend
rm -rf node_modules .next
npm install
```

#### API Connection Failed

1. **Verify backend is running:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Check NEXT_PUBLIC_API_URL in .env.local:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Restart frontend dev server:**
   ```bash
   # Stop the dev server (Ctrl+C)
   npm run dev
   ```

#### CORS Errors

Ensure backend `.env` has correct FRONTEND_URL:
```env
FRONTEND_URL=http://localhost:3000
```

### Common Issues

#### "Cannot find module '@prisma/client'"

```bash
cd ai-code-reviewer-backend
npm install @prisma/client
npx prisma generate
```

#### TypeScript Build Errors

```bash
# Backend
cd ai-code-reviewer-backend
npm run build

# Frontend
cd ai-code-reviewer-frontend
npm run build
```

#### Database Schema Out of Sync

```bash
cd ai-code-reviewer-backend
npx prisma migrate reset
npx prisma migrate dev
npx prisma generate
```

---

## 📊 Architecture Overview

### Backend Routes

All routes are prefixed with `/api`:

| Route Group | Endpoints | Authentication |
|------------|-----------|----------------|
| `/auth` | signup, login, logout, forgot-password, reset-password, me | Public (except /me) |
| `/validations` | GET /, /:id, /statistics, POST /manual, /:id/revalidate, DELETE /:id | Private |
| `/repositories` | GET /, /:id, POST /connect, PATCH /:id/settings, POST /:id/test-webhook, DELETE /:id | Private |
| `/notifications` | GET /, PATCH /:id/read, /read-all, DELETE /:id | Private |
| `/settings` | GET /, PATCH /, /profile, POST /change-password, /regenerate-api-key/:type | Private |

### Database Models

- **User** - User accounts with authentication
- **UserSettings** - User preferences and configurations
- **Repository** - Connected GitHub repositories
- **Validation** - Code validation jobs
- **FileResult** - Individual file analysis results
- **Notification** - User notifications
- **ApiKey** - Encrypted API keys storage
- **WebhookSecret** - GitHub webhook security

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Axios (HTTP Client)
- Socket.io-client (WebSocket)

**Backend:**
- Node.js/Express
- TypeScript
- PostgreSQL + Prisma ORM
- Redis + Bull (Job Queue)
- Socket.io (WebSocket)
- JWT Authentication
- OpenAI GPT-4 Integration

---

## 🎉 Success!

If you've followed all steps and everything works:

1. ✅ Backend running on http://localhost:5000
2. ✅ Frontend running on http://localhost:3000
3. ✅ Database connected and migrations applied
4. ✅ Redis connected for job queue
5. ✅ All API endpoints responding correctly

You can now:
- Create an account
- Connect GitHub repositories
- Run code validations
- View results and notifications
- Configure settings

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

## 🆘 Still Having Issues?

If you encounter issues not covered in this guide:

1. Check the console output for both frontend and backend
2. Verify all environment variables are set correctly
3. Ensure all services (PostgreSQL, Redis) are running
4. Check the logs in `ai-code-reviewer-backend/logs/`
5. Review the error messages and search for solutions

---

## 📝 Notes

- The application uses JWT tokens stored in localStorage for authentication
- Tokens expire after 7 days (configurable in backend .env)
- File uploads are limited to 10MB (configurable)
- Background jobs are processed using Bull queue with Redis
- WebSocket connections enable real-time notifications

**Happy Coding! 🚀**
