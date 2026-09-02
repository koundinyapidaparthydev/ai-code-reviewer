#!/bin/bash

# AI Code Reviewer - Quick Start Script
# This script helps you set up and run the application quickly

set -e

echo "🚀 AI Code Reviewer - Quick Start"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -d "ai-code-reviewer-backend" ] || [ ! -d "ai-code-reviewer-frontend" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

MISSING_DEPS=0

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    MISSING_DEPS=1
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js ${NODE_VERSION}${NC}"
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    MISSING_DEPS=1
else
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm ${NPM_VERSION}${NC}"
fi

if ! command_exists psql; then
    echo -e "${YELLOW}⚠️  PostgreSQL CLI not found (optional if using Docker)${NC}"
else
    echo -e "${GREEN}✅ PostgreSQL installed${NC}"
fi

if ! command_exists redis-cli; then
    echo -e "${YELLOW}⚠️  Redis CLI not found (optional if using Docker)${NC}"
else
    echo -e "${GREEN}✅ Redis installed${NC}"
fi

echo ""

if [ $MISSING_DEPS -eq 1 ]; then
    echo -e "${RED}❌ Please install missing dependencies and try again${NC}"
    exit 1
fi

# Setup backend
echo "🔧 Setting up backend..."
cd ai-code-reviewer-backend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Please create one from .env.example${NC}"
    echo "   Copy .env.example to .env and fill in your configuration"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

echo "🗄️  Setting up database..."
npx prisma generate
npx prisma migrate deploy || {
    echo -e "${YELLOW}⚠️  Running migrations in dev mode...${NC}"
    npx prisma migrate dev
}

echo "🏗️  Building backend..."
npm run build

cd ..

# Setup frontend
echo ""
echo "🔧 Setting up frontend..."
cd ai-code-reviewer-frontend

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating with defaults...${NC}"
    echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
    echo "NEXT_PUBLIC_WS_URL=http://localhost:5000" >> .env.local
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

cd ..

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd ai-code-reviewer-backend && npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd ai-code-reviewer-frontend && npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "📚 For detailed instructions, see STEPS.md"
