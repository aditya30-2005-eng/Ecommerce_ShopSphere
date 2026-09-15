# ShopSphere — Full-Stack MERN E-Commerce Platform

A production-style, portfolio-ready e-commerce web application built with **MongoDB, Express, React and Node.js** (MERN). It includes real JWT authentication, role-based authorization, a persistent cart, a full checkout flow with **Razorpay** payment verification, an admin dashboard, and product reviews.

> Built as a realistic reference project — not a toy demo. Every feature (auth, payments, cart, orders) is implemented with the validation and security practices you'd expect in a real store.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Installation](#installation)
5. [Environment Variables](#environment-variables)
6. [MongoDB Setup](#mongodb-setup)
7. [Razorpay Setup](#razorpay-setup)
8. [Running the App](#running-the-app)
9. [Demo Credentials](#demo-credentials)
10. [API Overview](#api-overview)
11. [Authentication Flow](#authentication-flow)
12. [Payment Flow](#payment-flow)
13. [Testing](#testing)
14. [Screenshots](#screenshots)
15. [Future Improvements](#future-improvements)

---

## Features

- 🛍️ Product catalog with search, category/brand/price filters, sorting and pagination
- ⭐ Product reviews with average rating (only for verified purchasers)
- 🔐 JWT authentication with bcrypt password hashing
- 👤 Role-based authorization (`user` / `admin`) with protected & admin-only routes
- 🛒 Persistent server-side cart with stock validation
- 💳 Real Razorpay integration — order creation & signature verification done server-side
- 📦 Full order lifecycle: Pending → Processing → Shipped → Delivered / Cancelled
- 🧑‍💼 Admin dashboard with revenue/order/user stats, product CRUD, and order management
- 📱 Fully responsive UI (mobile, tablet, desktop) built with Bootstrap 5 + custom SCSS
- ✅ Consistent error handling, loading/empty/error states throughout
- 🧪 Unit & integration tests on both frontend (Vitest) and backend (Jest + Supertest)

## Tech Stack

**Frontend:** React 18, React Router 6, Axios, Bootstrap 5 / React-Bootstrap, SCSS, Vite, Vitest + React Testing Library

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Razorpay SDK, Jest + Supertest + mongodb-memory-server

## Folder Structure

```
Ecommerce/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── components/         # Reusable UI: common/, layout/, product/, cart/, order/, admin/
│       ├── pages/               # Route-level pages (Home, Products, Checkout, Admin/*, ...)
│       ├── layouts/             # MainLayout, AdminLayout
│       ├── context/             # AuthContext, CartContext
│       ├── hooks/                # useAuth, useCart, useDebounce
│       ├── services/            # Axios API wrappers (one file per resource)
│       ├── utils/                # formatCurrency, validators, cart math, Razorpay loader
│       └── tests/               # Vitest unit/component tests
│
└── server/                     # Express backend
    ├── config/                  # db.js, razorpay.js
    ├── models/                  # User, Product, Cart, Order, Review
    ├── controllers/             # Business logic per resource
    ├── routes/                  # Express routers
    ├── middleware/               # authMiddleware, adminMiddleware, errorMiddleware
    ├── services/                 # paymentService.js (Razorpay order + signature verification)
    ├── utils/                    # generateToken, pricing (server-side price recalculation), validators
    ├── seed/                     # Demo products + seed script
    └── tests/                    # Jest + Supertest integration tests
```

## Installation

Requires **Node.js 18+** and a running **MongoDB** instance (local or Atlas).

```bash
# 1. Clone / open the project, then install each app's dependencies
cd server && npm install
cd ../client && npm install
```

## Environment Variables

Copy each `.env.example` to `.env` and fill in your own values. **Never commit `.env` files** — they are already listed in `.gitignore`.

**`server/.env`**
```
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**`client/.env`**
```
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

> Only the **public** Razorpay Key ID is ever exposed to the frontend/browser. `RAZORPAY_KEY_SECRET` lives exclusively on the server and is used only to sign/verify payments.

## MongoDB Setup

**Option A — Local MongoDB**
1. Install MongoDB Community Server and make sure `mongod` is running.
2. Use `MONGO_URI=mongodb://127.0.0.1:27017/ecommerce`.

**Option B — MongoDB Atlas (cloud, free tier)**
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Add your IP to the network access list and create a database user.
3. Copy the connection string into `MONGO_URI` in `server/.env`.

Once MongoDB is reachable, seed demo data:
```bash
cd server
npm run seed          # imports 14 demo products + an admin & a regular user
npm run seed:destroy  # wipes all products/users/carts/orders/reviews
```

## Razorpay Setup

1. Create a free account at [dashboard.razorpay.com](https://dashboard.razorpay.com).
2. Go to **Settings → API Keys** and generate a **Test Mode** key pair.
3. Put the Key ID in both `server/.env` (`RAZORPAY_KEY_ID`) and `client/.env` (`VITE_RAZORPAY_KEY_ID`).
4. Put the Key Secret **only** in `server/.env` (`RAZORPAY_KEY_SECRET`) — never in the frontend.
5. Use [Razorpay's test card numbers](https://razorpay.com/docs/payments/payments/test-card-details/) to simulate a payment end-to-end (e.g. card `4111 1111 1111 1111`, any future expiry, any CVV).

## Running the App

**Backend** (from `server/`):
```bash
npm run dev      # starts on http://localhost:5000 with nodemon
```

**Frontend** (from `client/`, in a separate terminal):
```bash
npm run dev      # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser. The frontend proxies API calls to `http://localhost:5000/api` via `VITE_API_URL`.

## Demo Credentials

These are **local development seed accounts only** (created by `npm run seed`) — safe to share since the database is your own local/dev instance:

| Role  | Email               | Password  |
|-------|---------------------|-----------|
| Admin | admin@example.com   | admin123  |
| User  | user@example.com    | user1234  |

## API Overview

| Method | Endpoint                          | Access        | Description |
|--------|------------------------------------|---------------|-------------|
| POST   | `/api/auth/register`               | Public        | Register a new user |
| POST   | `/api/auth/login`                  | Public        | Login and receive a JWT |
| GET    | `/api/auth/me`                     | Private       | Get the logged-in user's profile |
| PUT    | `/api/auth/me`                     | Private       | Update profile / password |
| GET    | `/api/products`                    | Public        | List products (search, filter, sort, paginate) |
| GET    | `/api/products/:id`                | Public        | Get a single product |
| POST   | `/api/products`                    | Admin         | Create a product |
| PUT    | `/api/products/:id`                | Admin         | Update a product |
| DELETE | `/api/products/:id`                | Admin         | Delete a product |
| GET    | `/api/products/:id/reviews`        | Public        | List reviews for a product |
| POST   | `/api/products/:id/reviews`        | Private       | Add a review (verified purchasers only) |
| GET    | `/api/cart`                        | Private       | Get the current user's cart |
| POST   | `/api/cart`                        | Private       | Add an item to the cart |
| PUT    | `/api/cart/:itemId`                | Private       | Update item quantity |
| DELETE | `/api/cart/:itemId`                | Private       | Remove an item |
| POST   | `/api/orders`                      | Private       | Create a Cash-on-Delivery order |
| GET    | `/api/orders/my`                   | Private       | Get the logged-in user's orders |
| GET    | `/api/orders/:id`                  | Private       | Get a single order (owner or admin) |
| GET    | `/api/orders`                      | Admin         | Get all orders |
| PUT    | `/api/orders/:id/status`           | Admin         | Update order status |
| POST   | `/api/payments/create-order`       | Private       | Create a Razorpay order from the cart |
| POST   | `/api/payments/verify`             | Private       | Verify payment signature & confirm the order |
| GET    | `/api/admin/stats`                 | Admin         | Dashboard stats (revenue, orders, users...) |
| GET    | `/api/admin/users`                 | Admin         | List all users |
| POST   | `/api/upload`                      | Admin         | Upload up to 5 product images (multipart/form-data, field `images`) |

## Authentication Flow

1. **Register**: the client posts `name/email/password/confirmPassword` to `/api/auth/register`. The server validates the input, checks for an existing email, then relies on a Mongoose `pre('save')` hook to **hash the password with bcrypt** before storing the user. A JWT is returned immediately.
2. **Login**: the server looks up the user (explicitly selecting the normally-hidden `password` field), compares it with `bcrypt.compare`, and — if valid — signs a JWT containing only the user's id.
3. **Session persistence**: the frontend stores the JWT (and a lightweight user object) in `localStorage`. `AuthContext` re-validates the token against `GET /api/auth/me` on every page load.
4. **Protected requests**: an Axios request interceptor automatically attaches `Authorization: Bearer <token>` to every API call.
5. **Route protection**: `ProtectedRoute` and `AdminRoute` components guard React Router routes on the client; `authMiddleware`/`adminMiddleware` enforce the same rules on the server — client-side checks are for UX only, the server is the real gatekeeper.

## Payment Flow

The project uses Razorpay's standard **Orders API** flow, with all pricing recomputed server-side so the frontend can never manipulate what gets charged:

1. User fills in shipping/contact details at Checkout and selects "Pay with Razorpay".
2. Frontend calls `POST /api/payments/create-order` with just the address/contact info (no prices).
3. Backend re-reads the user's cart, looks up **current prices and stock straight from MongoDB**, and builds the order total itself (`utils/pricing.js`).
4. Backend creates a `Pending` `Order` document, then asks Razorpay to create a matching order (`services/paymentService.js`), and returns the Razorpay order id + public key to the client.
5. Frontend opens the Razorpay Checkout modal using the official `checkout.js` script.
6. After the user pays, Razorpay's `handler` callback receives `razorpay_payment_id`, `razorpay_order_id` and `razorpay_signature`.
7. Frontend sends those three values to `POST /api/payments/verify`.
8. Backend recomputes the HMAC‑SHA256 signature using the **secret key** (`crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)`) and compares it to the one Razorpay sent. Only if they match does it:
   - mark the order `paymentStatus: 'Paid'`
   - decrement stock for every purchased product
   - clear the user's cart
9. Failed/invalid signatures mark the order `Failed` and return a 400 — the order is never silently trusted.
10. A Cash-on-Delivery path (`POST /api/orders`) is also available and goes through the exact same server-side price recalculation, without the payment gateway step.

## Testing

**Backend** (Jest + Supertest + an in-memory MongoDB, so no real DB is touched):
```bash
cd server
npm test
```
Covers registration/login validation, duplicate email handling, protected routes, product CRUD + admin authorization, and cart stock-limit enforcement.

**Frontend** (Vitest + React Testing Library):
```bash
cd client
npm test
```
Covers login/registration form validation, product card rendering, cart quantity/subtotal/total calculations, and `ProtectedRoute`/`AdminRoute` redirect behavior.

## Screenshots

_Add screenshots of the Home page, Products listing, Product Details, Cart, Checkout, and Admin Dashboard here once the app is running locally, e.g.:_

```
docs/screenshots/home.png
docs/screenshots/products.png
docs/screenshots/checkout.png
docs/screenshots/admin-dashboard.png
```

## Future Improvements

- Swap local disk image storage for Cloudinary/S3 (needed for most cloud hosts, since local disk storage doesn't persist/scale across deployments)
- Real transactional email for password reset and order confirmations
- Wishlist / saved-for-later
- Coupon codes and promotional pricing rules
- Order tracking with shipment webhooks
- Server-side rendering / static generation for SEO on product pages
- Rate limiting and refresh-token rotation for hardened auth

---

*Built as a demonstration/portfolio project. Not affiliated with Razorpay or any real store.*
