# Codebird — Frontend

The Codebird web app: a bird reviews your code. Next.js UI over the reviewer API.

## Features

- 🔐 User authentication with JWT
- 📊 Dashboard with validation statistics
- 🔍 Detailed validation history and reports
- 🔗 GitHub repository integration
- 📝 Manual code validation
- ⚙️ Customizable settings and preferences
- 🔔 Real-time notifications via WebSocket
- 📱 Fully responsive design

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env.local` and configure your environment variables:

```bash
cp .env.example .env.local
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── common/           # Reusable components
│   ├── layout/           # Layout components
│   └── ...               # Feature-specific components
├── lib/                   # Utilities and configurations
│   ├── api.ts            # Axios client
│   ├── websocket.ts      # WebSocket client
│   └── utils.ts          # Helper functions
├── store/                # Zustand stores
│   ├── authStore.ts
│   ├── validationStore.ts
│   └── ...
└── types/                # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `ws://localhost:5000` |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | GitHub OAuth client ID | - |

## Routes

### Public Routes
- `/login` - User login
- `/signup` - User registration
- `/forgot-password` - Password reset

### Protected Routes
- `/dashboard` - Main dashboard
- `/validations` - Validation history
- `/validations/[id]` - Validation details
- `/repositories` - Repository management
- `/repositories/connect` - Connect new repository
- `/manual-validation` - Manual code upload
- `/settings` - User settings

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
