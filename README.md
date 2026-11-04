# everythinganything

A modern, scalable full-stack application built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL**, **Next.js (App Router)**, **Axios**, **Zustand**, and **Docker**.

---

## 🏗️ Architecture Overview

The project is structured according to a **feature-based architecture** to ensure modularity, maintainability, and clean separation of concerns.

```text
everythinganything/
├── README.md                      # Project documentation & runbook
├── .gitignore                     # Git ignore rules
├── .dockerignore                  # Docker ignore rules
├── .env.development.example       # Dev environment variables template
├── .env.production.example        # Prod environment variables template
├── .env.development               # Dev environment variables (ignored by git)
├── .env.production                # Prod environment variables (ignored by git)
├── docker-compose.dev.yml         # Local development Docker setup with hot reload
├── docker-compose.prod.yml        # Production Docker configuration
│
├── backend/                       # Node.js + Express + TypeScript API
│   ├── Dockerfile                 # Multi-stage production build
│   ├── Dockerfile.dev             # Development container with hot reload
│   ├── package.json
│   ├── tsconfig.json              # Strict TypeScript configuration
│   └── src/
│       ├── app.ts                 # Express application setup, security, routes
│       ├── server.ts              # Server lifecycle & graceful shutdown
│       ├── config/
│       │   ├── env.ts             # Zod environment validation
│       │   └── database.ts        # PostgreSQL connection pool & health check
│       ├── shared/
│       │   ├── errors/            # Custom AppError classes
│       │   ├── middleware/        # Centralized error, 404, request logging
│       │   ├── utils/             # Standard API response & logger
│       │   └── types/             # Shared TypeScript interfaces
│       └── features/              # Feature modules (controllers, services, routes)
│
└── frontend/                      # Next.js 15 App Router + Tailwind CSS
    ├── Dockerfile                 # Standalone production container
    ├── Dockerfile.dev             # Development container with hot reload
    ├── package.json
    ├── next.config.ts
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── postcss.config.mjs
    └── src/
        ├── app/                   # Next.js App Router (layout, page, styles)
        ├── components/
        │   ├── ui/                # Shared atomic UI elements
        │   └── shared/            # Shared complex components
        ├── features/              # Feature-specific components and UI modules
        ├── hooks/                 # Custom React hooks
        ├── lib/
        │   └── api.ts             # Shared configured Axios client
        ├── stores/                # Zustand stores for complex client state
        ├── contexts/              # React Context for lightweight global state
        └── types/                 # Frontend TypeScript types
```

---

## 🚀 Quick Start

### Option 1: Running with Docker Compose (Recommended)

Make sure Docker and Docker Compose are installed and running.

#### Development Mode (with hot-reloading)
```bash
# Start all services (PostgreSQL, Backend API, Frontend Next.js)
docker compose -f docker-compose.dev.yml up --build

# Run in background (detached mode)
docker compose -f docker-compose.dev.yml up -d

# Stop services
docker compose -f docker-compose.dev.yml down

# Stop services and remove persistent database volumes
docker compose -f docker-compose.dev.yml down -v
```

#### Production Mode
```bash
docker compose -f docker-compose.prod.yml up --build -d
```

---

### Option 2: Running Locally (Node.js & npm)

#### 1. Backend Setup
From the repository root:
```bash
cd backend
npm install
npm run dev
```
The backend API starts on `http://localhost:4000`.
- Health check: `http://localhost:4000/api/v1/health`

#### 2. Frontend Setup
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend application starts on `http://localhost:3000`.

---

## ⚙️ Environment Variables

Environment templates are available at `.env.development.example` and `.env.production.example`.

| Variable | Description | Default Dev Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| `PORT` | Backend HTTP Port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/everythinganything_dev` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Public API endpoint for frontend | `http://localhost:4000/api/v1` |

---

## 🛠️ Verification & Health Checks

- **API Health**: `GET http://localhost:4000/api/v1/health`
  Returns system uptime, environment, and PostgreSQL connection status.
- **Frontend**: Navigate to `http://localhost:3000` to view the live dashboard confirming communication with the backend and database.

---

## 🔧 Troubleshooting

1. **Database connection failed (`ECONNREFUSED 5432`)**:
   - Ensure PostgreSQL is running locally or via `docker compose -f docker-compose.dev.yml up db`.
   - Verify `DATABASE_URL` matches your local credentials.

2. **CORS Errors**:
   - Confirm `CORS_ORIGIN` in backend environment matches the frontend origin (`http://localhost:3000`).

3. **Port Conflicts**:
   - If port `4000`, `3000`, or `5432` is already in use, update `.env.development` or kill the conflicting process.
