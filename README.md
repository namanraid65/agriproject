# AgriProject — MERN Full-Stack Agri Marketplace

A full-stack B2B/B2C agricultural marketplace built with MongoDB, Express, React, and Node.js.

## Features
- B2C retail shopping + B2B wholesale portal
- Product catalog with filters, search, pagination
- User auth (JWT) with role-based access
- Admin dashboard (products, categories, orders, CMS)
- RFQ (Request for Quote) system for wholesale buyers
- MongoDB Atlas cloud database

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT + HTTP-only cookies |
| Monorepo | Turborepo |

---

## Local Development

### Prerequisites
- Node.js 18+
- npm 9+

### Setup

```bash
# Clone the repo
git clone https://github.com/namanraid65/agriproject.git
cd agriproject

# Install all dependencies
npm install

# Create env file
cp .env.example .env
# Edit .env and add your MONGODB_URI and JWT_SECRET

# Seed the database (first time only)
npm run seed --workspace=apps/backend

# Start development servers (frontend + backend together)
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## Deployment

### Backend → Render.com (Free)
1. Go to [render.com](https://render.com) → New → Web Service
2. Connect this GitHub repo
3. Settings:
   - **Root Directory:** `apps/backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add Environment Variables:
   ```
   MONGODB_URI  = mongodb+srv://user:pass@cluster.mongodb.net/agriproject
   JWT_SECRET   = your_strong_secret
   NODE_ENV     = production
   PORT         = 5000
   JWT_EXPIRES_IN = 7d
   ```

### Frontend → Vercel (Free)
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import this GitHub repo
3. Settings:
   - **Root Directory:** `apps/frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL = https://your-render-backend.onrender.com/api
   ```

### MongoDB Atlas
Already configured. Ensure your Atlas cluster has:
- **Network Access** → Allow from anywhere (`0.0.0.0/0`)
- **Database Access** → A user with read/write access

---

## Admin Access
After seeding, login with:
- **Email:** admin@openagri.com
- **Password:** password123

---

## Project Structure
```
open-agri-mern/
├── apps/
│   ├── backend/          # Express API
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── server.js
│   │   └── seed.js       # Database seeder
│   └── frontend/         # React + Vite
│       └── src/
│           ├── pages/
│           ├── components/
│           └── context/
└── packages/
    └── shared/           # Shared utilities
```
