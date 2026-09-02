# ✅ Setup Checklist

Use this checklist to ensure everything is properly configured before running the application.

## Prerequisites ✅

- [ ] Node.js v18+ installed
- [ ] npm or yarn installed
- [ ] PostgreSQL v14+ installed (or Docker)
- [ ] Redis v6+ installed (or Docker)
- [ ] Git installed
- [ ] OpenAI API key obtained

---

## Backend Setup ✅

### 1. Environment Configuration
- [ ] Navigated to `ai-code-reviewer-backend/`
- [ ] Created `.env` file from `.env.example`
- [ ] Set `DATABASE_URL` with your PostgreSQL credentials
- [ ] Set `REDIS_HOST` and `REDIS_PORT`
- [ ] Set `JWT_SECRET` (min 32 characters, random string)
- [ ] Set `OPENAI_API_KEY` with your API key
- [ ] Set `FRONTEND_URL=http://localhost:3000`

### 2. Database Setup
- [ ] PostgreSQL service is running
- [ ] Database `ai_code_reviewer` created
- [ ] Database user created with proper permissions
- [ ] Can connect to database using psql or GUI tool

### 3. Redis Setup
- [ ] Redis service is running
- [ ] Can connect to Redis (test with `redis-cli ping`)

### 4. Dependencies & Build
- [ ] Ran `npm install` in backend directory
- [ ] Ran `npx prisma generate`
- [ ] Ran `npx prisma migrate dev`
- [ ] Ran `npm run build` (no errors)

### 5. Verification
- [ ] Backend starts with `npm run dev`
- [ ] See "Server running on http://localhost:5000"
- [ ] See "✅ Database connected"
- [ ] See "✅ Redis connected"
- [ ] Health endpoint works: `curl http://localhost:5000/health`

---

## Frontend Setup ✅

### 1. Environment Configuration
- [ ] Navigated to `ai-code-reviewer-frontend/`
- [ ] `.env.local` file exists with:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:5000/api
  NEXT_PUBLIC_WS_URL=http://localhost:5000
  ```

### 2. Dependencies
- [ ] Ran `npm install` in frontend directory
- [ ] No installation errors

### 3. Verification
- [ ] Frontend starts with `npm run dev`
- [ ] See "Local: http://localhost:3000"
- [ ] Can open http://localhost:3000 in browser
- [ ] Sign up page loads without errors
- [ ] Console shows no API connection errors

---

## Application Testing ✅

### 1. Backend Health Check
- [ ] Open http://localhost:5000/health
- [ ] Returns JSON: `{"status":"ok",...}`

### 2. User Registration
- [ ] Open http://localhost:3000
- [ ] Click "Sign Up"
- [ ] Fill form (name, email, password)
- [ ] Submit form
- [ ] Registration successful (no errors in console)

### 3. User Login
- [ ] Navigate to login page
- [ ] Enter credentials from step 2
- [ ] Click "Sign In"
- [ ] Redirected to dashboard
- [ ] Dashboard shows user name

### 4. API Endpoints (with auth token)

Get your JWT token from:
- Browser DevTools → Application → Local Storage → `token`
- Or from Network tab after login

Then test endpoints:

```bash
# Replace YOUR_TOKEN with actual JWT token
TOKEN="YOUR_TOKEN"

# Test auth endpoint
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Test validations endpoint
curl http://localhost:5000/api/validations \
  -H "Authorization: Bearer $TOKEN"

# Test repositories endpoint
curl http://localhost:5000/api/repositories \
  -H "Authorization: Bearer $TOKEN"

# Test notifications endpoint
curl http://localhost:5000/api/notifications \
  -H "Authorization: Bearer $TOKEN"

# Test settings endpoint
curl http://localhost:5000/api/settings \
  -H "Authorization: Bearer $TOKEN"
```

All should return JSON (not 401 errors).

### 5. WebSocket Connection
- [ ] Open browser DevTools → Network → WS tab
- [ ] Should see WebSocket connection to localhost:5000
- [ ] Connection status: "101 Switching Protocols"

---

## Route Verification ✅

### Authentication Routes (6)
- [ ] POST `/api/auth/signup`
- [ ] POST `/api/auth/login`
- [ ] POST `/api/auth/logout`
- [ ] GET `/api/auth/me`
- [ ] POST `/api/auth/forgot-password`
- [ ] POST `/api/auth/reset-password`

### Validation Routes (5)
- [ ] GET `/api/validations`
- [ ] GET `/api/validations/:id`
- [ ] GET `/api/validations/statistics`
- [ ] POST `/api/validations/manual`
- [ ] POST `/api/validations/:id/revalidate`

### Repository Routes (5)
- [ ] GET `/api/repositories`
- [ ] POST `/api/repositories/connect`
- [ ] PATCH `/api/repositories/:id/settings`
- [ ] POST `/api/repositories/:id/test-webhook`
- [ ] DELETE `/api/repositories/:id`

### Notification Routes (3)
- [ ] GET `/api/notifications`
- [ ] PATCH `/api/notifications/:id/read`
- [ ] PATCH `/api/notifications/read-all`

### Settings Routes (5)
- [ ] GET `/api/settings`
- [ ] PATCH `/api/settings`
- [ ] PATCH `/api/settings/profile`
- [ ] POST `/api/settings/change-password`
- [ ] POST `/api/settings/regenerate-api-key/:type`

---

## Common Issues & Solutions ✅

### Issue: Port 5000 already in use
```bash
lsof -ti:5000 | xargs kill -9
```

### Issue: Port 3000 already in use
```bash
lsof -ti:3000 | xargs kill -9
```

### Issue: Database connection failed
```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Test connection
psql -U ai_reviewer -d ai_code_reviewer -h localhost
```

### Issue: Redis connection failed
```bash
# Check Redis is running
redis-cli ping

# Start Redis
brew services start redis
```

### Issue: Prisma Client error
```bash
cd ai-code-reviewer-backend
rm -rf node_modules/.prisma
npx prisma generate
npm run build
```

### Issue: Module not found
```bash
# Backend
cd ai-code-reviewer-backend
rm -rf node_modules
npm install

# Frontend
cd ai-code-reviewer-frontend
rm -rf node_modules .next
npm install
```

### Issue: Environment variables not loading
- [ ] Check `.env` file exists in backend root
- [ ] Check `.env.local` file exists in frontend root
- [ ] Restart both servers after changes
- [ ] No quotes around values unless needed
- [ ] No spaces around `=` sign

### Issue: CORS errors
- [ ] Backend `.env` has `FRONTEND_URL=http://localhost:3000`
- [ ] Frontend `.env.local` has correct `NEXT_PUBLIC_API_URL`
- [ ] Restart backend after env changes

---

## Final Verification ✅

### All Services Running
- [ ] PostgreSQL: `brew services list` or `systemctl status postgresql`
- [ ] Redis: `redis-cli ping` returns "PONG"
- [ ] Backend: http://localhost:5000/health returns JSON
- [ ] Frontend: http://localhost:3000 loads

### Build Status
- [ ] Backend: `npm run build` exits 0
- [ ] Frontend: `npm run build` exits 0 (optional, takes time)

### File Structure
- [ ] `README.md` exists
- [ ] `STEPS.md` exists
- [ ] `API_ALIGNMENT.md` exists
- [ ] `SUMMARY.md` exists
- [ ] `quick-start.sh` exists and is executable

### Documentation
- [ ] Read `STEPS.md` for detailed setup
- [ ] Read `API_ALIGNMENT.md` for API reference
- [ ] Read `SUMMARY.md` for completion status

---

## 🎉 Ready to Go!

When all items are checked:

✅ **Backend is ready** - All routes implemented and tested
✅ **Frontend is ready** - All components connected to API
✅ **Database is ready** - Schema migrated and Prisma generated
✅ **Documentation is ready** - Complete setup and API guides
✅ **Environment is ready** - All services configured and running

**You can now start using the AI Code Reviewer!** 🚀

---

## Quick Start Commands

```bash
# Terminal 1 - Backend
cd ai-code-reviewer-backend
npm run dev

# Terminal 2 - Frontend  
cd ai-code-reviewer-frontend
npm run dev

# Terminal 3 - Check logs (optional)
cd ai-code-reviewer-backend
tail -f logs/app.log
```

Open http://localhost:3000 and enjoy! 🎊
