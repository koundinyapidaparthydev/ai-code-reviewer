# AI Code Validator - Backend

Backend API server for the AI Code Validator platform built with Node.js, Express, TypeScript, PostgreSQL, and Redis.

## Features

- 🔐 **Authentication** - JWT-based authentication with signup, login, logout, and password reset
- 🤖 **AI Code Validation** - Integration with OpenAI GPT-4 for intelligent code analysis
- 📁 **File Upload** - Support for manual file uploads (up to 20 files, 1MB each)
- 🔄 **Background Processing** - Bull queue for async validation processing
- 🔌 **WebSocket** - Real-time updates for validation progress
- 📊 **Statistics** - User dashboard with validation metrics
- 🔔 **Notifications** - In-app notifications for validation results
- ⚡ **Rate Limiting** - Protects API from abuse
- 🛡️ **Security** - Helmet.js, CORS, JWT token blacklisting

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Queue**: Redis + Bull
- **AI**: OpenAI API (GPT-4)
- **WebSocket**: Socket.io
- **Authentication**: JWT with bcryptjs
- **File Upload**: Multer

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- OpenAI API Key

## Installation

1. **Clone the repository**
```bash
cd ai-code-reviewer-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up the database**
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

5. **Start the development server**
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_HOST` | Redis host | Yes |
| `REDIS_PORT` | Redis port | Yes |
| `JWT_SECRET` | Secret key for JWT | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `PORT` | Server port (default: 5000) | No |

See `.env.example` for complete list.

## Project Structure

```
src/
├── config/          # Configuration files (database, redis, multer)
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
├── queues/          # Bull queue setup
├── workers/         # Queue processors
├── websocket/       # WebSocket server
├── validators/      # Zod validation schemas
├── utils/           # Utility functions
├── app.ts          # Express app setup
└── server.ts       # Server entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### Validations
- `POST /api/validations/manual` - Upload files for validation
- `GET /api/validations` - Get all validations
- `GET /api/validations/statistics` - Get statistics
- `GET /api/validations/:id` - Get validation details
- `POST /api/validations/:id/revalidate` - Revalidate
- `DELETE /api/validations/:id` - Delete validation

### Health
- `GET /health` - Health check endpoint

## Database Schema

The application uses Prisma ORM with the following models:

- **User** - User accounts
- **UserSettings** - User preferences
- **Repository** - Connected GitHub repositories
- **Validation** - Validation records
- **FileResult** - Per-file validation results
- **Notification** - User notifications
- **PasswordReset** - Password reset tokens
- **TokenBlacklist** - Revoked JWT tokens

## WebSocket Events

### Client → Server
- `connection` - Connect with JWT token

### Server → Client
- `validation:started` - Validation processing started
- `validation:progress` - Progress update
- `validation:completed` - Validation completed
- `validation:failed` - Validation failed

## Scripts

```bash
# Development
npm run dev          # Start dev server with nodemon

# Build
npm run build        # Compile TypeScript to JavaScript

# Production
npm start            # Run compiled code

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```

## Development

The server uses `nodemon` for hot-reloading during development. Any changes to `.ts` files will automatically restart the server.

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Set strong `JWT_SECRET`
3. Use production database credentials
4. Configure proper CORS origins
5. Set up SSL/TLS certificates
6. Use a process manager like PM2

```bash
npm run build
NODE_ENV=production npm start
```

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Validations: 20 validations per hour per user

## Security

- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens with 7-day expiry
- Token blacklisting on logout
- Helmet.js security headers
- CORS configuration
- Input validation with Zod
- SQL injection prevention via Prisma

## Error Handling

All errors are centralized through error middleware:
- `AppError` - Operational errors (400, 401, 404, etc.)
- Unhandled errors - 500 Internal Server Error
- Development mode includes stack traces

## Logging

Winston logger configured for:
- Console output in development
- File logs (`logs/error.log`, `logs/combined.log`)
- Structured JSON format
- Error tracking with stack traces

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
