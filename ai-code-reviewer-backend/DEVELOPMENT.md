# Development Quick Start Guide

## Setup Steps

### 1. Prerequisites
```bash
# Check versions
node --version  # Should be 18+
psql --version  # Should be 14+
redis-cli --version  # Should be 6+
```

### 2. Database Setup

#### PostgreSQL
```bash
# Create database
createdb ai_code_validator

# Or using psql
psql -U postgres
CREATE DATABASE ai_code_validator;
\q
```

Update `.env` with your connection string:
```
DATABASE_URL="postgresql://username:password@localhost:5432/ai_code_validator?schema=public"
```

#### Run Migrations
```bash
npm run prisma:migrate
```

### 3. Redis Setup

#### macOS (using Homebrew)
```bash
brew install redis
brew services start redis
```

#### Ubuntu/Debian
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

#### Docker
```bash
docker run -d -p 6379:6379 redis:latest
```

### 4. Environment Configuration

Copy `.env.example` to `.env` and update:

**Required variables:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- `OPENAI_API_KEY` - Get from https://platform.openai.com

**Optional but recommended:**
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` for GitHub integration
- `SENDGRID_API_KEY` or SMTP settings for email notifications

### 5. Start Development Server

```bash
# Terminal 1: Start Redis (if not running as service)
redis-server

# Terminal 2: Start backend
npm run dev
```

Server will be available at http://localhost:5000

### 6. Test the API

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","name":"Test User"}'
```

## Common Issues

### Port already in use
```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)
```

### PostgreSQL connection error
- Verify PostgreSQL is running: `pg_isready`
- Check connection string format
- Ensure database exists

### Redis connection error
- Verify Redis is running: `redis-cli ping` (should return PONG)
- Check Redis host and port in `.env`

### Prisma errors
```bash
# Reset database (WARNING: deletes all data)
npm run prisma:reset

# Regenerate Prisma client
npm run prisma:generate
```

## Development Workflow

### 1. Making Database Changes

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name your_migration_name

# 3. Generate client
npm run prisma:generate
```

### 2. Viewing Database

```bash
# Open Prisma Studio
npm run prisma:studio
```

Browse at http://localhost:5555

### 3. Testing Endpoints

Use tools like:
- **Postman**: Import collection from `postman/` folder (if available)
- **Thunder Client**: VS Code extension
- **curl**: Command line requests

## Project Scripts

```bash
npm run dev          # Development mode with hot reload
npm run build        # Compile TypeScript
npm start            # Run production build
npm run lint         # Check code style
npm run lint:fix     # Fix code style issues
```

## File Structure for New Features

```
src/
├── routes/          # Add new routes here
├── controllers/     # Add controllers for routes
├── services/        # Add business logic
├── validators/      # Add Zod schemas
└── middleware/      # Add middleware
```

### Example: Adding a new feature

1. Create validator: `src/validators/feature.validator.ts`
2. Create service: `src/services/feature.service.ts`
3. Create controller: `src/controllers/feature.controller.ts`
4. Create routes: `src/routes/feature.routes.ts`
5. Register routes in `src/app.ts`

## Debugging

### Enable detailed logs
```bash
# In .env
NODE_ENV=development
```

Logs are written to:
- Console (development)
- `logs/error.log` (errors only)
- `logs/combined.log` (all logs)

### VS Code Debug Configuration

Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev"],
  "skipFiles": ["<node_internals>/**"]
}
```

## Testing with Frontend

1. Start backend: `npm run dev` (port 5000)
2. Start frontend: Navigate to frontend folder and run `npm run dev` (port 3000)
3. Frontend will connect to backend at http://localhost:5000

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure production database
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and error tracking
- [ ] Enable rate limiting
- [ ] Set up automated backups
- [ ] Use environment-specific `.env` files
- [ ] Test all endpoints
- [ ] Review security headers

## Resources

- [Express.js Docs](https://expressjs.com/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [OpenAI API Docs](https://platform.openai.com/docs/)
- [Bull Queue Docs](https://github.com/OptimalBits/bull)
- [Socket.io Docs](https://socket.io/docs/)
