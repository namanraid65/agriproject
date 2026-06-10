# OpenAgri — Agricultural B2B/B2C Marketplace

## Project Structure
- apps/frontend — React + Vite + Tailwind customer-facing site and admin panel
- apps/backend — Node.js + Express REST API
- packages/shared — Shared constants (UserRoles, MarketModes, RFQStatus)

## Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm 10+

## Setup

### 1. Clone and install
npm install

### 2. Configure environment variables

Copy and fill in:
- apps/backend/.env (see .env.example)
- apps/frontend/.env (see .env.example)

### 3. Seed the database
cd apps/backend
node seed.js

### 4. Run in development
From root:
npm run dev

Frontend runs on http://localhost:5173
Backend runs on http://localhost:5000

## Admin credentials (after seeding)
Email: admin@openagri.com
Password: password123

## Environment variables

### Backend
| Variable | Description |
|---|---|
| PORT | Server port (default 5000) |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT signing |
| JWT_EXPIRES_IN | Token expiry (e.g. 7d) |
| CLIENT_URL | Frontend URL for CORS |
| NODE_ENV | development or production |

### Frontend
| Variable | Description |
|---|---|
| VITE_API_URL | Backend API base URL |

## Key features
- B2B/B2C mode switch with localStorage persistence
- Wholesale tier pricing with MOQ enforcement
- CMS-driven homepage, about, and policy pages
- Admin panel: products, categories, orders, enquiries, CMS, settings
- JWT auth with httpOnly cookie + Bearer token support
