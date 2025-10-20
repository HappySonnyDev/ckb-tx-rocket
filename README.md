# CKB Tx Rocket

A CKB blockchain visualization project built with Phaser 3, React TypeScript, and NestJS backend.

This is a **monorepo** project managed with **pnpm workspaces**.

## Features

- 🚀 CKB blockchain data visualization using Phaser 3 engine
- ⚛️ React + TypeScript web interface
- 🏗️ NestJS backend for blockchain data processing
- 📊 Real-time blockchain data synchronization
- 🔌 WebSocket support for live updates

## Project Structure

```
ckb-tx-rocket/
├── apps/
│   ├── web/              # Frontend application (Phaser 3 + React + Vite)
│   │   ├── src/
│   │   │   ├── game/     # Phaser visualization engine
│   │   │   ├── services/ # CKB blockchain services
│   │   │   └── hooks/    # React hooks
│   │   ├── public/       # Static assets
│   │   └── vite/         # Vite configuration
│   │
│   └── server/           # Backend application (NestJS)
│       ├── src/
│       │   ├── api/      # API modules (blocks, transactions, websocket)
│       │   ├── core/     # Core services (database, CKB client, sync)
│       │   └── common/   # Shared utilities
│       ├── prisma/       # Database schema
│       └── docs/         # API documentation
│
├── pnpm-workspace.yaml   # Workspace configuration
├── package.json          # Root package (workspace management)
└── tsconfig.json         # Root TypeScript configuration
```

## Requirements

- Node.js (v18 or higher recommended)
- pnpm (v10.11.0 or higher)
- PostgreSQL (for the backend database)

## Getting Started

### Install Dependencies

```bash
# Install all dependencies for the entire monorepo
pnpm install
```

### Development

```bash
# Run both web and server in development mode
pnpm dev

# Run only the web application
pnpm dev:web

# Run only the server application
pnpm dev:server
```

### Build

```bash
# Build both applications
pnpm build

# Build only the web application
pnpm build:web

# Build only the server application
pnpm build:server
```

### Production

```bash
# Start the server in production mode
pnpm start:server
```

## Working with Individual Apps

### Web Application

```bash
# Navigate to web app
cd apps/web

# Run development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Server Application

```bash
# Navigate to server app
cd apps/server

# Set up environment variables (first time only)
cp .env.example .env
# Edit .env file with your configuration

# Generate Prisma client (required before first build)
pnpm prisma generate

# Sync database schema (creates/updates database.db)
pnpm prisma db push

# Start development server with watch mode
pnpm start:dev

# Build for production
pnpm build

# Start production server
pnpm start:prod
```

## Environment Variables

### Server Application (`apps/server/.env`)

Create a `.env` file in the server directory:

```bash
cd apps/server
cp .env.example .env
```

Required environment variables:

```env
# Database Configuration (SQLite)
DATABASE_URL="file:./prisma/database.db"

# CKB Node Configuration
CKB_RPC_URL=http://127.0.0.1:8114
CKB_WS_URL=ws://127.0.0.1:28114

# Server Configuration
PORT=3000
HOST=0.0.0.0

# CORS Configuration
CORS_ORIGIN=http://localhost:8080

# Sync Configuration
SYNC_ENABLED=true
SYNC_START_BLOCK=0
SYNC_BATCH_SIZE=100
```

**Note**: The project uses **SQLite** for the database. The database file will be created at `apps/server/prisma/database.db` when you run `prisma db push`.

## Tech Stack

### Web Application
- **Phaser 3** - Game engine for blockchain visualization
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Socket.IO Client** - WebSocket communication

### Server Application
- **NestJS** - Backend framework
- **Prisma** - ORM and database toolkit
- **Socket.IO** - WebSocket server
- **CKB Lumos** - CKB blockchain SDK
- **SQLite** - Database

## License

MIT
