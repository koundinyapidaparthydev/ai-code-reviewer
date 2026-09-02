# AI Code Validator - Quick Start

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- PostgreSQL running
- Redis running
- OpenAI API key

---

## Step 1: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd ai-code-reviewer-backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/ai_code_validator"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=$(openssl rand -base64 32)
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
VALIDATION_LIMIT_PER_HOUR=20
EOF

# Setup database
npm run prisma:generate
npm run prisma:migrate

# Start server
npm run dev
```

✅ Backend running on http://localhost:5000

---

## Step 2: Frontend Setup (1 minute)

```bash
# Open new terminal
cd ai-code-reviewer-frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
echo "NEXT_PUBLIC_WS_URL=http://localhost:5000" >> .env.local

# Start frontend
npm run dev
```

✅ Frontend running on http://localhost:3000

---

## Step 3: Test It Out (2 minutes)

### Option A: Use the Web Interface
1. Open http://localhost:3000
2. Click "Sign Up"
3. Create account: email, password, name
4. Login with your credentials
5. Click "Manual Validation"
6. Upload code files
7. Watch AI analyze your code!

### Option B: Use curl
```bash
# Register
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","name":"Test User"}'

# Login (save the token)
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}' | jq -r '.token')

# Create a test file
echo "function test() { console.log('hello') }" > test.js

# Upload for validation
curl -X POST http://localhost:5000/api/validations/manual \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@test.js"

# Check validations
curl http://localhost:5000/api/validations \
  -H "Authorization: Bearer $TOKEN"
```

---

## Common Issues & Solutions

### Port Already in Use
```bash
# Kill process on port 5000
kill -9 $(lsof -ti:5000)

# Kill process on port 3000
kill -9 $(lsof -ti:3000)
```

### PostgreSQL Not Running
```bash
# macOS
brew services start postgresql

# Ubuntu/Debian
sudo systemctl start postgresql

# Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres
```

### Redis Not Running
```bash
# macOS
brew services start redis

# Ubuntu/Debian
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis
```

### Database Connection Error
```bash
# Create database manually
psql -U postgres
CREATE DATABASE ai_code_validator;
\q

# Update DATABASE_URL in .env with correct credentials
```

### OpenAI API Error
- Get API key from: https://platform.openai.com/api-keys
- Add credits to your OpenAI account
- Update OPENAI_API_KEY in backend .env

---

## What's Included

### Backend
- ✅ JWT Authentication
- ✅ AI Code Validation (OpenAI GPT-4)
- ✅ Background Processing (Bull Queue)
- ✅ WebSocket Real-time Updates
- ✅ Rate Limiting
- ✅ File Upload (20 files, 1MB each)
- ✅ Notification System
- ✅ Statistics Dashboard

### Frontend
- ✅ Modern UI with Tailwind CSS
- ✅ Authentication Pages
- ✅ Dashboard with Stats
- ✅ Validation Management
- ✅ File Upload Interface
- ✅ Real-time Updates
- ✅ Notifications
- ✅ Settings & Profile

---

## Project Structure

```
Ai-Code-Reviewer/
├── ai-code-reviewer-frontend/   # Next.js 14 Frontend
│   ├── src/app/                 # Pages
│   ├── src/components/          # UI Components
│   ├── src/store/               # State Management
│   └── src/lib/                 # API Client
│
├── ai-code-reviewer-backend/    # Node.js Backend
│   ├── src/routes/              # API Routes
│   ├── src/services/            # Business Logic
│   ├── src/middleware/          # Middleware
│   ├── src/workers/             # Queue Workers
│   └── prisma/                  # Database Schema
│
└── PROJECT_SUMMARY.md           # Complete Documentation
```

---

## Next Steps

1. **Read Full Documentation**: Check `PROJECT_SUMMARY.md`
2. **Backend Guide**: See `ai-code-reviewer-backend/DEVELOPMENT.md`
3. **Frontend Guide**: See `ai-code-reviewer-frontend/README.md`
4. **Database**: View with `npm run prisma:studio`
5. **API Endpoints**: See `PROJECT_SUMMARY.md` for full list

---

## Key Features to Try

### 1. Manual Validation
Upload files → Get AI analysis → View detailed results

### 2. Dashboard
View validation statistics and recent activity

### 3. Real-time Updates
Watch validation progress in real-time via WebSocket

### 4. Revalidation
Re-run validation on previous uploads

### 5. Notifications
Get notified when validations complete

---

## Testing Endpoints

```bash
# Health Check
curl http://localhost:5000/health

# Get Current User (with token)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Get Statistics
curl http://localhost:5000/api/validations/statistics \
  -H "Authorization: Bearer $TOKEN"

# Get Notifications
curl http://localhost:5000/api/notifications \
  -H "Authorization: Bearer $TOKEN"
```

---

## Environment Requirements

### Backend
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- OpenAI API Key

### Frontend
- Node.js 18+
- Backend running on port 5000

---

## Development Scripts

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm run prisma:studio # Open database GUI
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Check code style
```

---

## Support

- **Issues**: Create issue in repository
- **Documentation**: See `PROJECT_SUMMARY.md`
- **Logs**: Check `ai-code-reviewer-backend/logs/`

---

## Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Database created and migrated
- [ ] Redis connected
- [ ] OpenAI API key configured
- [ ] Can register new user
- [ ] Can login
- [ ] Can upload files
- [ ] AI validation works
- [ ] Dashboard shows statistics
- [ ] Notifications appear

---

**Status**: ✅ Ready to Go!

Open http://localhost:3000 and start validating code!
