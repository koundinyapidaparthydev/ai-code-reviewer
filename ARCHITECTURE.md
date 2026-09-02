# 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AI CODE REVIEWER                                │
│                         Full-Stack Application Flow                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER (Port 3000)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         Next.js 14 Frontend                           │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │                                                                        │  │
│  │  📱 Pages (App Router)          🎨 Components                        │  │
│  │  ├─ /auth (login, signup)       ├─ Navbar                            │  │
│  │  ├─ /dashboard                  ├─ Sidebar                           │  │
│  │  ├─ /validations                ├─ ValidationCard                    │  │
│  │  ├─ /repositories               ├─ RepositoryCard                    │  │
│  │  └─ /settings                   └─ NotificationBell                  │  │
│  │                                                                        │  │
│  │  🗄️ State Management (Zustand)  📡 API Client (Axios)               │  │
│  │  ├─ authStore                   ├─ auth.login()                      │  │
│  │  ├─ validationStore             ├─ validations.getAll()              │  │
│  │  ├─ repositoryStore             ├─ repositories.connect()            │  │
│  │  └─ notificationStore           └─ settings.update()                 │  │
│  │                                                                        │  │
│  │  🔌 WebSocket Client (Socket.io)                                     │  │
│  │  └─ Real-time notifications & validation updates                     │  │
│  │                                                                        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│                    Environment: .env.local                                   │
│                    NEXT_PUBLIC_API_URL=http://localhost:5000/api            │
│                                                                               │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                                 │ HTTP/HTTPS + WebSocket
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SERVER LAYER (Port 5000)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      Express.js Backend (Node.js)                     │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │                                                                        │  │
│  │  🛡️ Middleware Layer                                                 │  │
│  │  ├─ helmet (Security headers)                                         │  │
│  │  ├─ cors (Cross-origin)                                               │  │
│  │  ├─ morgan (Logging)                                                  │  │
│  │  ├─ rateLimiter (Rate limiting)                                       │  │
│  │  ├─ authMiddleware (JWT validation)                                   │  │
│  │  └─ errorHandler (Error handling)                                     │  │
│  │                                                                        │  │
│  │  🛣️ Routes Layer                                                      │  │
│  │  ├─ /api/auth            (6 endpoints)  [Public/Protected]          │  │
│  │  ├─ /api/validations     (5 endpoints)  [Protected]                 │  │
│  │  ├─ /api/repositories    (5 endpoints)  [Protected]                 │  │
│  │  ├─ /api/notifications   (3 endpoints)  [Protected]                 │  │
│  │  └─ /api/settings        (5 endpoints)  [Protected]                 │  │
│  │                                                                        │  │
│  │  🎯 Services Layer (Business Logic)                                  │  │
│  │  ├─ authService          - User authentication & JWT                 │  │
│  │  ├─ validationService    - Code validation orchestration             │  │
│  │  ├─ notificationService  - Notification management                   │  │
│  │  └─ aiService            - OpenAI GPT-4 integration                  │  │
│  │                                                                        │  │
│  │  📦 Queue System (Bull + Redis)                                      │  │
│  │  ├─ validationQueue      - Background job queue                      │  │
│  │  └─ validationWorker     - Process validation jobs                   │  │
│  │                                                                        │  │
│  │  🔌 WebSocket Server (Socket.io)                                     │  │
│  │  ├─ validation_started                                                │  │
│  │  ├─ validation_progress                                               │  │
│  │  ├─ validation_completed                                              │  │
│  │  └─ new_notification                                                  │  │
│  │                                                                        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│                    Environment: .env                                         │
│                    DATABASE_URL, REDIS_HOST, JWT_SECRET, etc.               │
│                                                                               │
└───────────────┬───────────────────────┬─────────────────────────────────────┘
                │                       │
                │                       │
                ▼                       ▼
┌───────────────────────────┐  ┌─────────────────────────┐
│    DATABASE LAYER          │  │    CACHE/QUEUE LAYER    │
├───────────────────────────┤  ├─────────────────────────┤
│                            │  │                          │
│  🗄️ PostgreSQL (v14+)     │  │  🔴 Redis (v6+)         │
│  Port: 5432                │  │  Port: 6379             │
│                            │  │                          │
│  📊 Prisma ORM             │  │  📦 Bull Queue          │
│  ├─ User                   │  │  ├─ Job queue           │
│  ├─ UserSettings           │  │  └─ Job processing      │
│  ├─ Repository             │  │                          │
│  ├─ Validation             │  │  💾 Session cache       │
│  ├─ FileResult             │  │  └─ Rate limit storage  │
│  ├─ Notification           │  │                          │
│  ├─ ApiKey                 │  └─────────────────────────┘
│  └─ WebhookSecret          │
│                            │
└───────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  🤖 OpenAI GPT-4 API       🐙 GitHub API         📧 SMTP (Optional)        │
│  └─ Code analysis          └─ Repository data     └─ Email notifications    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          REQUEST FLOW EXAMPLE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  1. User clicks "Create Validation" button                                   │
│                    ▼                                                          │
│  2. Frontend calls apiClient.validations.createManualValidation(data)       │
│                    ▼                                                          │
│  3. Axios sends POST /api/validations/manual with JWT token                 │
│                    ▼                                                          │
│  4. Backend authMiddleware validates JWT                                     │
│                    ▼                                                          │
│  5. validationController receives request                                    │
│                    ▼                                                          │
│  6. validationService.createValidation() called                              │
│                    ▼                                                          │
│  7. Validation record created in PostgreSQL (Prisma)                         │
│                    ▼                                                          │
│  8. Job added to Bull queue (Redis)                                          │
│                    ▼                                                          │
│  9. Response sent to frontend: { id, status: 'pending' }                    │
│                    ▼                                                          │
│ 10. validationWorker picks up job from queue                                 │
│                    ▼                                                          │
│ 11. aiService.analyzeCode() calls OpenAI API                                 │
│                    ▼                                                          │
│ 12. Results saved to FileResult & Validation tables                          │
│                    ▼                                                          │
│ 13. WebSocket event 'validation_completed' emitted                           │
│                    ▼                                                          │
│ 14. Frontend receives WebSocket event                                        │
│                    ▼                                                          │
│ 15. validationStore updates, UI re-renders                                   │
│                    ▼                                                          │
│ 16. User sees results on dashboard                                           │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          AUTHENTICATION FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  1. User submits login form                                                  │
│  2. POST /api/auth/login { email, password }                                │
│  3. authService verifies credentials (bcrypt)                                │
│  4. JWT token generated (jsonwebtoken)                                       │
│  5. Token returned: { token, user }                                          │
│  6. Frontend stores token in localStorage                                    │
│  7. All subsequent requests include: Authorization: Bearer <token>          │
│  8. authMiddleware validates token on protected routes                       │
│  9. req.user populated with decoded user data                                │
│ 10. Request proceeds to controller                                           │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          WEBSOCKET FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Frontend                          Backend                                   │
│     │                                  │                                      │
│     │  socket.connect()                │                                      │
│     │─────────────────────────────────▶│                                      │
│     │                                  │                                      │
│     │  emit('join_room', {userId})     │                                      │
│     │─────────────────────────────────▶│  User joins room                    │
│     │                                  │                                      │
│     │                                  │  Validation completed                │
│     │                                  │  (in worker)                         │
│     │                                  │                                      │
│     │  on('validation_completed')      │                                      │
│     │◀─────────────────────────────────│  emit to user's room                │
│     │                                  │                                      │
│     │  Update UI                       │                                      │
│     │                                  │                                      │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          SECURITY LAYERS                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  🛡️ Layer 1: Network Security                                               │
│     └─ CORS (only allow FRONTEND_URL)                                       │
│     └─ Helmet (security headers)                                             │
│     └─ HTTPS (production)                                                    │
│                                                                               │
│  🛡️ Layer 2: Rate Limiting                                                  │
│     └─ Express rate limiter (100 req/15min)                                 │
│     └─ Per-endpoint limits                                                   │
│                                                                               │
│  🛡️ Layer 3: Authentication                                                 │
│     └─ JWT token validation                                                  │
│     └─ Token expiration (7 days)                                             │
│                                                                               │
│  🛡️ Layer 4: Input Validation                                               │
│     └─ Request body validation (Zod schemas)                                │
│     └─ File type/size validation                                             │
│                                                                               │
│  🛡️ Layer 5: Data Protection                                                │
│     └─ Password hashing (bcrypt, 10 rounds)                                 │
│     └─ SQL injection protection (Prisma)                                    │
│     └─ API key encryption                                                    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEPLOYMENT PORTS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  3000  ▶ Frontend (Next.js)                                                 │
│  5000  ▶ Backend API (Express)                                              │
│  5432  ▶ PostgreSQL Database                                                │
│  6379  ▶ Redis Cache/Queue                                                  │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

                              ╔═══════════════════╗
                              ║  ALL SYSTEMS GO!  ║
                              ║    100% READY     ║
                              ╚═══════════════════╝
```

## Component Interaction Matrix

| Component | Interacts With | Purpose |
|-----------|---------------|---------|
| Frontend Pages | API Client, Stores | User interface & routing |
| API Client | Backend Routes | HTTP requests |
| Zustand Stores | Frontend Components | State management |
| WebSocket Client | WebSocket Server | Real-time updates |
| Backend Routes | Controllers | Request routing |
| Controllers | Services | Request handling |
| Services | Database, Queue, AI | Business logic |
| Prisma ORM | PostgreSQL | Database access |
| Bull Queue | Redis, Workers | Background jobs |
| Workers | AI Service, Database | Job processing |
| WebSocket Server | Frontend Clients | Push notifications |

## Technology Stack Summary

**Frontend:**
- Framework: Next.js 14.2.0
- Language: TypeScript 5.0+
- Styling: Tailwind CSS 3.4+
- State: Zustand 4.5+
- HTTP: Axios 1.7+
- WebSocket: Socket.io-client 4.7+

**Backend:**
- Runtime: Node.js 18+
- Framework: Express 4.18+
- Language: TypeScript 5.0+
- ORM: Prisma 5.22+
- Queue: Bull 4.12+
- Auth: JWT (jsonwebtoken 9.0+)
- Password: bcrypt 5.1+
- WebSocket: Socket.io 4.7+

**Database:**
- Database: PostgreSQL 14+
- Cache: Redis 6+
- Models: 8 (User, UserSettings, Repository, Validation, FileResult, Notification, ApiKey, WebhookSecret)

**External:**
- AI: OpenAI GPT-4
- Version Control: GitHub API
- Email: SMTP (optional)

## Performance Considerations

- **Caching:** Redis for session and rate limit data
- **Queue:** Background job processing for long-running tasks
- **WebSocket:** Real-time updates without polling
- **Indexes:** Database indexes on frequently queried fields
- **Pagination:** List endpoints support pagination
- **Rate Limiting:** Prevents abuse and ensures fair usage
