# OpenAgri — B2B & B2C Agricultural E-Commerce Marketplace

A full-stack agricultural marketplace built with MongoDB, Express, React, and Node.js. It bridges Indian farmers, wholesale distributors, and retail consumers with an authenticated, zero-middleman agricultural supply marketplace, featuring dynamic B2B bulk pricing, RFQ workflows, returns tracking, and editable CMS layouts.

## Screenshots

| Storefront Homepage (Retail B2C Mode) | Product Catalog (Wholesale B2B Mode) |
| --- | --- |
| ![Storefront Homepage](./screenshoot/homepage.png) | ![Product Catalog](./screenshoot/products.png) |

| Admin Panel Dashboard & Real-time Alerts |
| --- |
| ![Admin Panel Dashboard](./screenshoot/admin.png) |

---

## 🚀 Live Demo

* **User / Customer Storefront:** [https://agriproject-frontend.vercel.app](https://agriproject-frontend.vercel.app)
* **Admin Dashboard:** [https://agriproject-frontend.vercel.app/admin](https://agriproject-frontend.vercel.app/admin)
* **Backend API Base URL:** [https://agriproject-37n7.onrender.com/api](https://agriproject-37n7.onrender.com/api)

### 🔑 Administrator Credentials
To access the Admin Dashboard:
1. Navigate to the [Admin Dashboard](https://agriproject-frontend.vercel.app/admin) link above.
2. Log in using the following pre-seeded credentials:
   - **Email:** `admin@openagri.com`
   - **Password:** `password123`

---

## Features Completed

- **B2C & B2B Dual Modes**: Quick retail-wholesale toggle with localStorage persistence and mode-specific UI styling (emerald for B2C, amber for B2B).
- **Dynamic Wholesale Pricing**: Graduated pricing tables based on bulk purchase quantity tiers with Minimum Order Quantity (MOQ) enforcement.
- **Amazon-style Quantity Steppers**: Responsive inline quantity selectors (`- [x] in Cart +`) with typed-input limits and error boundaries on cards, featured grids, details, and cart pages.
- **Verified Purchase Reviews**: 5-point star rating engine with custom vector SVG stars supporting fractional fills; review submissions are locked to verified buyers.
- **Indian State & City Pincode Auto-detection**: Checkout form with state and city select dropdowns, complete with real-time pincode auto-population via the India Post API.
- **Amazon-style Returns Stepper**: 4-stage return tracking progress bar (`Return Requested` ➔ `Picked Up` ➔ `Received at Hub` ➔ `Refund Processed`) with conditional stock restoration.
- **Admin Bell Notifications**: Dynamic real-time alerts for low-stock products, out-of-stock items, new B2B enquiries, and pending customer orders.
- **Device Image Uploads**: Direct local image file selection and thumbnail previewing in category/product creation and editing forms.
- **Dynamic Live Order Counter**: Animated homepage ticker showing live orders being packed (B2C) or cargo trucks en route (B2B) fetched dynamically from the database.
- **CMS-driven Pages**: Editable promotional slideshow banners, client testimonials, settings configurations, and static content pages (About Us, Contact, Policies, FAQs).
- **Secure Authentication & Guard Routing**: Protected client pages with role-based redirects and strict backend password validations.

---

## Dataflow

The diagram below details the architecture and data communication flows of the OpenAgri marketplace platform:

```mermaid
graph TD
    User([User / Client Browser])
    Vite[React Frontend - Vite Client]
    Express[Express Backend API Server]
    Mongo[(MongoDB Atlas Database)]
    Pincode[India Post API - Pincode Verification]
    Uploads[Local storage / uploads folder]
    
    User <--> |Interacts / UI actions| Vite
    Vite <--> |HTTP Requests / JSON / JWT Header| Express
    Express <--> |Mongoose Queries / Persistence| Mongo
    Vite --> |Pincode Lookup| Pincode
    Express --> |Saves images| Uploads
```

### Key Application Flows:
1. **Authentication**: Client sends credentials (`email`/`password`) ➔ Express API checks against database ➔ Returns token ➔ Stored in browser `localStorage` and appended dynamically via Axios interceptors on subsequent operations.
2. **Checkout & Verification**: Typing a valid 6-digit Indian Pincode triggers a background call to the India Post API ➔ City and State dropdowns auto-populate ➔ Submitting the order decrements stock counts in the `Product` schema inside MongoDB.
3. **Product/Category Image Uploads**: Admin triggers file selection ➔ Form wrapper POSTs multipart form payload to `/api/upload` ➔ Backend saves image to static `uploads/` directory on disk ➔ Returns path URL to React form ➔ Saved to database document on form submit.
4. **Order Returns & Refund Flow**: Customer requests return ➔ Status changes to `return_requested` ➔ Admin updates return stages in detail sidebar ➔ On transitions to `refunded`, backend triggers inventory restoration, safely incrementing stock back in database.

---

## 🤖 AI-Assisted Development

This project was engineered, debugged, and optimized in collaboration with advanced **AI Pair-Programming Assistants**. AI agents were leveraged throughout the software development lifecycle (SDLC) to accelerate development, improve code quality, and implement complex features:

* **Feature Engineering**: Co-designed and implemented complex workflows such as the B2B wholesale tiered pricing tables, real-time India Post Pincode API validation, fractional-fill vector SVG ratings, and the Amazon-style returns tracking pipeline.
* **Automated Debugging & QA**: Utilized AI-guided diagnostic workflows, including programmatically launching headless Puppeteer browser scripts in the workspace to capture console error logs and trace React Hook boundaries or component rendering crashes.
* **Responsive Styling & UX**: Refined storefront layout grids, card configurations, and main navigation headers to ensure mobile responsiveness and cross-device compatibility.
* **Scripting & Asset Automation**: Generated automated Python scripts to compile category product collage graphics and manage static inventories.

---

## Tech Stack

**Frontend**
- React 18 with Vite
- React Router DOM 6
- Axios (with JWT & Market Mode interceptors)
- TailwindCSS
- Lucide React & Tabler Icons

**Backend**
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT Auth & HTTP-Only Cookies
- Multer (for device uploads)
- Cors & Helmet security headers

**Monorepo**
- Turborepo

---

## Project Structure

```text
open-agri-mern/
|-- apps/
|   |-- backend/          # Express REST API
|   |   |-- src/
|   |   |   |-- controllers/
|   |   |   |-- models/
|   |   |   |-- routes/
|   |   |   `-- server.js
|   |   `-- seed.js       # Database seeder
|   |-- frontend/         # React + Vite Client
|   |   `-- src/
|   |       |-- components/
|   |       |-- context/
|   |       |-- hooks/
|   |       |-- pages/
|   |       `-- services/
`-- packages/
    `-- shared/           # Shared constants
```

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

## Deployment Configuration

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
