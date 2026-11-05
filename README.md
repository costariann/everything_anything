# everythinganything

A modern, scalable multi-category e-commerce platform built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL**, **Prisma**, **Next.js 15 (App Router)**, **Axios**, **Zustand**, **Framer Motion**, and **Tailwind CSS**.

---

## 🌟 Key Capabilities & Architectural Highlights

1. **🌗 Dual Light & Dark Theme System**:
   - **Automatic Day/Night Toggling**: Automatically sets **Light Mode** during daytime (06:00 to 18:00) and **Dark Mode** at night (18:00 to 06:00) based on local time.
   - **Manual User Override**: Users can click the theme switcher anytime in the storefront navbar, admin header, and login page to force Light, force Dark, or return to Automatic day/night mode.
   - **Zero Flicker & Persistence**: Stored in `localStorage` with Tailwind's `darkMode: 'class'` class toggling.

2. **🎠 Customizable Hero Slider & Section Banners**:
   - **Dynamic Carousel**: The storefront homepage features a Framer Motion animated background slider with customizable marketing slides, responsive call-to-actions, and auto-rotation.
   - **Promotional Marketing Banners**: Admin-controllable section banners (`PROMO_MIDDLE`, `PROMO_BOTTOM`).
   - **Admin Management Interface**: Located at `/admin/banners` where administrators can create, preview, upload images to Firebase Storage, re-order, and delete slides and banners.
   - **Default Seeded Banners**: Pre-seeded with curated high-definition e-commerce banners until customized.

3. **✨ Framer Motion Visual Experience**:
   - Smooth staggered page transitions, floating hero slides, card zoom interactions, modal backdrops, and cart drawers powered by `framer-motion`.

4. **🛒 Mandatory Guest Checkout**:
   - Customers are never forced to register. Guest shoppers can browse, add items to cart, enter shipping details, and complete purchase with instant live order tracking.

5. **🔐 Security & Dual ID Architecture**:
   - **Internal Numeric IDs (`id: Int`)**: Used internally for high-performance indexing and foreign keys.
   - **Public Identifiers (`publicId: String / CUID`)**: Exposed exclusively across RESTful endpoints and URLs.
   - **Role-based JWT Authentication**: Distinguishes between `CUSTOMER` and `ADMIN` with protected administrative routes.
   - **Environment-based Secrets**: Credentials and sensitive keys are strictly managed via `.env` files and `serviceAccountKey.json`.

---

## 🏗️ Architecture Overview

```text
everythinganything/
├── README.md                      # Comprehensive project documentation & runbook
├── serviceAccountKey.json         # Firebase Storage credentials (git-ignored)
├── .gitignore                     # Git ignore rules for environment and credentials
├── .env.development.example       # Development environment template
├── .env.development               # Local development environment configuration
├── docker-compose.dev.yml         # Dev Docker Compose (hot reload + Postgres)
├── docker-compose.prod.yml        # Multi-stage production container configuration
│
├── backend/                       # Node.js + Express + Prisma + TypeScript API
│   ├── prisma/
│   │   ├── schema.prisma          # PostgreSQL relational schema (dual-ID & soft delete)
│   │   └── seed.ts                # Database seed script (admin, categories, brands, products, banners)
│   ├── src/
│   │   ├── app.ts                 # Express initialization, security headers, routes
│   │   ├── server.ts              # HTTP server on Port 4001
│   │   ├── config/
│   │   │   ├── env.ts             # Zod environment variable validation
│   │   │   └── database.ts        # Prisma client singleton & connection tester
│   │   ├── shared/
│   │   │   ├── middleware/        # authGuard, roleGuard, validate, errorHandler
│   │   │   ├── errors/            # Custom AppError classes
│   │   │   └── utils/             # JWT, passwordHash, slugify, firebaseStorage
│   │   └── features/
│   │       ├── auth/              # Customer & admin authentication
│   │       ├── banners/           # Hero slider & promo banners CRUD
│   │       ├── categories/        # Public listing & admin category CRUD
│   │       ├── brands/            # Public listing & admin brand CRUD
│   │       ├── products/          # Catalogue, search, filtering & admin CRUD
│   │       ├── orders/            # Mandatory Guest Checkout & order tracking
│   │       ├── inventory/         # Stock adjustment & low-stock alerts
│   │       ├── admin/             # Executive dashboard metrics & customer list
│   │       └── media/             # Firebase Storage media uploads
│
└── frontend/                      # Next.js 15 App Router + React 19 + Tailwind CSS + Framer Motion
    ├── src/
    │   ├── app/
    │   │   ├── (storefront)/      # Public customer shopping pages
    │   │   │   ├── page.tsx       # Homepage (HeroSlider, Featured, Categories, Bestsellers, PromoBanner)
    │   │   │   ├── products/      # Catalogue & Product details
    │   │   │   ├── categories/    # Categories showcase
    │   │   │   ├── brands/        # Brands showcase
    │   │   │   ├── cart/          # Full shopping cart
    │   │   │   ├── checkout/      # Mandatory Guest Checkout & Customer order placement
    │   │   │   └── orders/        # Order confirmation & live status tracking
    │   │   ├── (auth)/            # Sign In & Registration with demo quick-fill
    │   │   ├── (customer)/        # Customer portal & order history
    │   │   └── (admin)/admin/     # Protected Administrative Dashboard
    │   │       ├── page.tsx       # Overview metrics & recent transactions
    │   │       ├── banners/       # Hero slider & promotional banner management
    │   │       ├── products/      # Product & variant management
    │   │       ├── categories/    # Category management
    │   │       ├── brands/        # Brand management
    │   │       ├── inventory/     # In-place stock adjusters & alerts
    │   │       ├── orders/        # Order processing & fulfillment status updates
    │   │       └── customers/     # Registered accounts directory
    │   ├── components/
    │   │   ├── ui/                # ThemeToggle, Button, Input, Modal, Badge, Card, Select
    │   │   ├── storefront/        # HeroSlider, PromoBanner
    │   │   └── shared/            # Navbar, Footer, CartDrawer, AdminSidebar, AdminHeader
    │   ├── contexts/              # ThemeContext (day/night auto detection & manual toggle)
    │   ├── features/              # Feature services (Axios API calls: banners, products, orders, etc.)
    │   ├── stores/                # Zustand stores (persistent cart & auth)
    │   └── lib/api.ts             # Configured Axios client with JWT interceptor
```

---

## 🚀 Getting Started

### 1. Database Setup & Seeding

Ensure your local PostgreSQL service is running on port 5432, then push the schema and seed starter data:

```bash
# Push Prisma schema to PostgreSQL
npm --prefix backend run prisma:push

# Seed database with your admin account, products, and default banners
npm --prefix backend run seed
```

### 2. Running Locally

#### Start the Backend API (Port 4001)
```bash
cd backend
npm run dev
```
- Health Check: `http://localhost:4001/api/v1/health`
- Banners API: `http://localhost:4001/api/v1/banners`
- API Root: `http://localhost:4001/api/v1`

#### Start the Frontend Storefront & Admin (Port 3001)
```bash
cd frontend
npm run dev
```
- Storefront: `http://localhost:3001`
- Hero & Banner Manager: `http://localhost:3001/admin/banners`
- Admin Dashboard: `http://localhost:3001/admin`
- Sign In: `http://localhost:3001/login`

---

## 🔑 Administrator & Demo Accounts

Credentials configured in `.env`:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `dacostaobiriyeboah@gmail.com` | *(Configured in `.env`)* | Complete `/admin` operations, banners & storefront |
| **Customer** | `customer@example.com` | `Customer123!` | Account portal, order history & storefront |
| **Guest** | *No account required* | *None* | Mandatory instant guest checkout |

---

## 🎨 Theme System Guide

- **Auto Mode (Default)**: Dynamically checks the client's local time:
  - `06:00 – 18:00`: Switches automatically to **Light Theme**.
  - `18:00 – 06:00`: Switches automatically to **Dark Theme**.
- **Manual Mode**: Clicking the Sun or Moon icon on any page immediately overrides the time-based trigger and saves your preference in `localStorage`.
