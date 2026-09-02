#!/bin/bash

# AI Code Validator - Quick Setup Script
# This script helps you get started quickly

echo "🚀 AI Code Validator - Quick Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ .env.local created. Please update it with your configuration."
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local and set:"
    echo "   - NEXT_PUBLIC_API_URL (your backend API URL)"
    echo "   - NEXT_PUBLIC_WS_URL (your WebSocket server URL)"
    echo "   - NEXT_PUBLIC_GITHUB_CLIENT_ID (optional, for GitHub OAuth)"
    echo ""
else
    echo "✅ .env.local already exists"
    echo ""
fi

# Check if backend is running (optional)
echo "🔍 Checking backend connection..."
BACKEND_URL="${NEXT_PUBLIC_API_URL:-http://localhost:5000/api}"

if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" | grep -q "200"; then
    echo "✅ Backend is running and accessible"
else
    echo "⚠️  Backend not detected at $BACKEND_URL"
    echo "   Make sure your backend server is running before starting the frontend"
fi

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Update .env.local with your backend URL"
echo "2. Start the development server: npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Available commands:"
echo "  npm run dev    - Start development server"
echo "  npm run build  - Build for production"
echo "  npm start      - Start production server"
echo "  npm run lint   - Run ESLint"
echo ""
echo "📚 For more information, see:"
echo "   - README.md"
echo "   - DEVELOPMENT_GUIDE.md"
echo ""
echo "Happy coding! 🎉"
