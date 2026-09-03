# Codebird

https://github.com/koundinyapidaparthydev/ai-code-reviewer/releases/download/demo/demo.mp4

A bird reviews your code. Codebird reads your files, then tells you what to fix.

Tool-using code reviewer MVP: upload a workspace, queue a job, inspect with sandboxed tools, persist findings, and score labeled evals. Optional local stdio MCP extract. Not a marketplace, not hosted MCP.

## Run the demo

```bash
# 1) Infra
docker compose up -d postgres redis
# or: local Postgres + Redis on 5432 / 6379

# 2) Backend
cd ai-code-reviewer-backend
cp .env.example .env   # set DATABASE_URL, REDIS_*; leave OPENAI_API_KEY empty for the free sandbox reviewer
npx prisma generate
npx prisma db push
npm install
npm run demo:seed      # demo@local / demo-password + fixture 01 job
npm run dev            # API http://localhost:5000  health: { ok, redis, db, reviewMode }

# 3) Frontend
cd ../ai-code-reviewer-frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
echo "NEXT_PUBLIC_WS_URL=http://localhost:5000" >> .env.local
npm install
npm run dev            # http://localhost:3000  login demo@local / demo-password

# 4) Evals
cd ../ai-code-reviewer-backend
npm run eval           # prints precision/recall, writes eval/last-report.json
# GET /api/eval/last (Bearer token) returns that report
```

## Re-run eval (Test MVP)

From the repo root or the backend package:

```bash
cd ai-code-reviewer-backend
# leave OPENAI_API_KEY empty (or a placeholder) to use the deterministic sandbox reviewer
npm run eval
# same command from repo root:
# npm run eval
```

The runner scores every folder in `fixtures/eval/` (must_fix labels vs critical/high findings), prints precision/recall/f1, and writes `ai-code-reviewer-backend/eval/last-report.json`. See `TEST_MVP.md` for the 41–65 checklist.

`REVIEW_MODE=tools` is the default (plan → up to 8 read-only tool calls → structured findings). `REVIEW_MODE=legacy` dumps file contents into GPT-4. Missing/placeholder `OPENAI_API_KEY` uses lint+grep only (no billed tokens).

All-in-one local deploy: `docker compose up --build` (api + web + redis + postgres). Live URLs and demo login: [DEMO_STAGING.md](./DEMO_STAGING.md). MCP is stdio-only — do not host it.

## Architecture

`upload files → job workspace (sandboxed) → Bull queue → agent (tools or legacy dump) → findings + toolCalls on the validation → dashboard list → npm run eval on fixtures/eval`

Read-only tools: `read_file`, `grep`, `list_files`, `run_lint`, `git_diff`. Path traversal is rejected. Local MCP (`mcp-server/`) reuses `read_file` / `grep` / `list_files` over stdio only.

**Codebird** is an intelligent code review platform: a bird-themed UI over a tool-using reviewer that analyzes commits and uploaded files, then shows findings in plain English.

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)

## 🌟 Features

- **🔍 Automated Code Analysis** - AI-powered analysis of your code commits
- **📊 Quality Scoring** - Get detailed quality scores for each file and overall commit
- **💡 Smart Recommendations** - Receive actionable suggestions for improvement
- **🔔 Real-time Notifications** - Stay updated with WebSocket-based notifications
- **🔗 GitHub Integration** - Connect repositories and analyze commits automatically
- **📈 Statistics Dashboard** - Track your code quality metrics over time
- **⚙️ Customizable Settings** - Configure AI models, sensitivity, and preferences
- **🔐 Secure Authentication** - JWT-based auth with password reset functionality
- **🐦 Codebird UI** - Warm cream, ink, and coral; a bird mark; findings as readable cards

## 🏗️ Architecture

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **HTTP Client:** Axios
- **WebSocket:** Socket.io-client

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Queue:** Bull (Redis-backed)
- **AI Integration:** OpenAI GPT-4
- **WebSocket:** Socket.io
- **Authentication:** JWT

### Database Schema
- Users & Authentication
- Repository Management
- Validation Jobs & Results
- Notifications
- User Settings
- API Keys (Encrypted)
- Webhook Secrets

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)
- OpenAI API key

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Ai-Code-Reviewer
```

### 2. Run Quick Start Script (macOS/Linux)

```bash
chmod +x quick-start.sh
./quick-start.sh
```

Or follow the [detailed setup guide](./STEPS.md).

### 3. Configure Environment Variables

**Backend** (`ai-code-reviewer-backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_code_reviewer"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`ai-code-reviewer-frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

### 4. Start Services

**Terminal 1 - Backend:**
```bash
cd ai-code-reviewer-backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd ai-code-reviewer-frontend
npm run dev
```

### 5. Open Application

Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[Complete Setup Guide](./STEPS.md)** - Detailed instructions for setup and configuration
- **[API Alignment](./API_ALIGNMENT.md)** - Complete API endpoint documentation
- **[Frontend Architecture](./frontend_architecture.md)** - Frontend design and structure
- **[Backend Architecture](./backend_architecture.md)** - Backend design and structure
- **[Database Architecture](./database_architecture.md)** - Database schema and relationships

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - Create new account
- `POST /login` - Authenticate user
- `POST /logout` - End session
- `GET /me` - Get current user
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token

### Validations (`/api/validations`)
- `GET /` - List all validations
- `GET /:id` - Get validation details
- `GET /statistics` - Get validation statistics
- `POST /manual` - Create manual validation
- `POST /:id/revalidate` - Revalidate code

### Repositories (`/api/repositories`)
- `GET /` - List connected repositories
- `POST /connect` - Connect new repository
- `DELETE /:id` - Disconnect repository
- `PATCH /:id/settings` - Update repository settings
- `POST /:id/test-webhook` - Test webhook connection

### Notifications (`/api/notifications`)
- `GET /` - List notifications
- `PATCH /:id/read` - Mark as read
- `PATCH /read-all` - Mark all as read

### Settings (`/api/settings`)
- `GET /` - Get user settings
- `PATCH /` - Update settings
- `PATCH /profile` - Update profile
- `POST /change-password` - Change password
- `POST /regenerate-api-key/:type` - Regenerate API key

## 🧪 Testing

### Backend Tests
```bash
cd ai-code-reviewer-backend
npm test
```

### Frontend Tests
```bash
cd ai-code-reviewer-frontend
npm test
```

## 🏭 Production Build

### Backend
```bash
cd ai-code-reviewer-backend
npm run build
npm start
```

### Frontend
```bash
cd ai-code-reviewer-frontend
npm run build
npm start
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on all endpoints
- CORS protection
- Helmet.js security headers
- SQL injection protection via Prisma
- XSS protection
- Encrypted API key storage

## 🎯 Roadmap

- [ ] GitHub App integration for automatic webhook setup
- [ ] Support for GitLab and Bitbucket
- [ ] Multi-language code analysis
- [ ] Custom rule engine
- [ ] Team collaboration features
- [ ] CI/CD integration plugins
- [ ] Advanced analytics and reporting
- [ ] Code quality trends over time
- [ ] Integration with Slack/Discord
- [ ] Mobile app

## 🐛 Troubleshooting

See the [STEPS.md](./STEPS.md#troubleshooting) guide for common issues and solutions.

### Quick Fixes

**Database connection issues:**
```bash
cd ai-code-reviewer-backend
npx prisma migrate reset
npx prisma generate
```

**Port already in use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Clear caches:**
```bash
# Backend
cd ai-code-reviewer-backend
rm -rf node_modules .next dist
npm install

# Frontend
cd ai-code-reviewer-frontend
rm -rf node_modules .next
npm install
```

## 📊 Project Structure

```
Ai-Code-Reviewer/
├── ai-code-reviewer-backend/     # Backend API server
│   ├── src/
│   │   ├── routes/               # API routes
│   │   ├── controllers/          # Request handlers
│   │   ├── services/             # Business logic
│   │   ├── middleware/           # Express middleware
│   │   ├── config/               # Configuration
│   │   ├── queue/                # Job queue
│   │   ├── worker/               # Background workers
│   │   ├── websocket/            # WebSocket server
│   │   └── utils/                # Utilities
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   └── package.json
│
├── ai-code-reviewer-frontend/    # Frontend Next.js app
│   ├── src/
│   │   ├── app/                  # Next.js pages
│   │   ├── components/           # React components
│   │   ├── lib/                  # Libraries & API client
│   │   ├── store/                # State management
│   │   └── types/                # TypeScript types
│   └── package.json
│
├── STEPS.md                      # Setup instructions
├── API_ALIGNMENT.md              # API documentation
├── README.md                     # This file
└── quick-start.sh                # Quick setup script
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- All contributors and users of this project

## 📞 Support

For support, email support@example.com or open an issue in the repository.

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

**Codebird — a bird reviews your code.** Built with Next.js, Express, and OpenAI.
