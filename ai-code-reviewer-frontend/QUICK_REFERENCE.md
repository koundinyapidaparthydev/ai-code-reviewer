# Quick Reference Guide

## 🚀 Getting Started (3 Steps)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your backend URL

# 3. Start development server
npm run dev
```

Visit: http://localhost:3000

## 📁 Project Structure

```
├── src/
│   ├── app/                 # Next.js pages
│   │   ├── (auth)/         # Login, Signup, Forgot Password
│   │   └── (dashboard)/    # Dashboard, Validations, Repos, Settings
│   ├── components/          # Reusable UI components
│   ├── lib/                # Utils, API client, WebSocket
│   ├── store/              # Zustand state management
│   └── types/              # TypeScript definitions
├── public/                  # Static assets
└── Configuration files
```

## 🎨 Key Components

### Layout
- `Navbar` - Top navigation with notifications
- `Sidebar` - Left sidebar navigation
- `DashboardLayout` - Wrapper for protected pages

### Common Components
- `Button` - Styled button with variants
- `Card` - Content container
- `Input` - Form input with validation
- `Modal` - Popup dialog
- `Badge` - Status indicators
- `Table` - Data table with pagination

## 🔧 Common Tasks

### Add a New Page
```typescript
// src/app/(dashboard)/your-page/page.tsx
'use client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function YourPage() {
  return (
    <DashboardLayout>
      <h1>Your Page</h1>
    </DashboardLayout>
  );
}
```

### Add a New API Endpoint
```typescript
// In src/lib/api.ts, add to ApiClient class:
async yourEndpoint(data: any) {
  const response = await this.client.post('/your-endpoint', data);
  return response.data;
}

// Usage in component:
import apiClient from '@/lib/api';
const result = await apiClient.yourEndpoint(data);
```

### Use State Management
```typescript
// Import store
import { useAuthStore } from '@/store/authStore';

// In component
const { user, login, logout } = useAuthStore();

// Access state
console.log(user);

// Call actions
await login(email, password);
```

### Show Notifications
```typescript
import { toast } from 'react-hot-toast';

toast.success('Success message');
toast.error('Error message');
toast.loading('Loading...', { id: 'unique-id' });
```

## 🎯 Routes

### Public
- `/login` - User login
- `/signup` - User registration
- `/forgot-password` - Password reset

### Protected (requires auth)
- `/dashboard` - Main dashboard
- `/validations` - Validation list
- `/validations/:id` - Validation details
- `/repositories` - Repository management
- `/repositories/connect` - Connect new repo
- `/manual-validation` - Upload files
- `/settings` - User settings

## 🌐 Environment Variables

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# WebSocket URL
NEXT_PUBLIC_WS_URL=ws://localhost:5000

# GitHub OAuth (optional)
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id
```

## 🛠️ npm Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🎨 Styling

Using **Tailwind CSS**:

```tsx
// Example: Primary button with icon
<button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
  <Icon size={16} />
  Click Me
</button>

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

## 🔐 Authentication Flow

1. User submits login form
2. `useAuthStore().login()` called
3. API request to `/api/auth/login`
4. Token stored in localStorage
5. User redirected to `/dashboard`
6. `DashboardLayout` checks auth status
7. WebSocket connection established

## 📡 WebSocket Events

```typescript
import wsClient from '@/lib/websocket';

// Listen for events
wsClient.on('validation:completed', (data) => {
  console.log('Validation completed:', data);
});

// Send events
wsClient.send('custom:event', { data });

// Cleanup
const cleanup = wsClient.on('event', callback);
cleanup(); // Remove listener
```

## 🐛 Troubleshooting

### TypeScript Errors
```bash
# Install dependencies
npm install

# Restart VS Code
# Cmd/Ctrl + Shift + P -> "Reload Window"
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Build Errors
```bash
# Clear cache
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

## 📚 Key Libraries

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **Axios** - HTTP requests
- **Socket.io** - WebSocket client
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Lucide React** - Icon library

## 🎯 Best Practices

1. **Use TypeScript** - Define types for props and data
2. **Client Components** - Use `'use client'` for interactive components
3. **Error Handling** - Always wrap API calls in try-catch
4. **User Feedback** - Show toast notifications for actions
5. **Loading States** - Display spinners during async operations
6. **Responsive Design** - Test on mobile, tablet, and desktop
7. **Accessibility** - Use semantic HTML and ARIA labels

## 📖 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [React Hook Form](https://react-hook-form.com/)

---

**Quick Help**: Check `DEVELOPMENT_GUIDE.md` for detailed documentation
