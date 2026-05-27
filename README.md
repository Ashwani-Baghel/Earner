# Earner - Freelance Marketplace (Fiverr Clone)

Earner is a modern, full-featured freelance marketplace platform inspired by Fiverr. It provides a robust dual-dashboard system for Buyers and Sellers, real-time messaging, comprehensive gig management, and secure authentication.

---

## 🚀 Tech Stack

- **Frontend Framework**: Next.js (App Router), React
- **Styling**: Tailwind CSS
- **Database & ORM**: PostgreSQL (hosted on Supabase/Neon), Prisma ORM
- **Authentication**: Firebase Authentication (Email/Password & Google Sign-in)
- **Real-time Chat**: Dedicated Node.js + Express + Socket.io Server
- **Deployment**: Vercel (Frontend), Render/Railway (Chat Server)

---

## 🧠 Fundamental Architecture & Logic

To understand this codebase, you need to understand how the three main pillars of the app work together: **Authentication**, **Gig Management**, and **Real-Time WebSockets**.

### 1. How Authentication Works (Firebase + PostgreSQL Sync)
Earner uses a hybrid authentication model. Firebase handles the secure login, but PostgreSQL handles the business logic (roles, profiles, orders).

1. **Client-Side Login**: Users sign in via Google or Email/Password using Firebase Client SDK inside the frontend (`AuthContext.tsx`).
2. **The Handshake**: Once Firebase logs the user in, `AuthContext` retrieves the Firebase JWT token and makes an authorized request to `/api/users/me`.
3. **Server-Side Verification**: The Next.js API route (`lib/apiAuth.ts`) uses the **Firebase Admin SDK** to securely verify the JWT token. 
4. **Database Syncing**: If the token is valid, the server checks the PostgreSQL `User` table via Prisma. 
   - If the user exists, it returns their profile and role (`BUYER`, `SELLER`, `ADMIN`).
   - If it's their first time logging in, the server creates a new row in the PostgreSQL database using their Firebase `uid` as the primary key.

*Where it happens*: 
- Client state: `src/context/AuthContext.tsx`
- Server verification: `src/lib/apiAuth.ts` and `src/app/api/users/me/route.ts`

### 2. The Gig Structure & Buying Flow
A "Gig" in Earner is a highly relational piece of data. It is not just one table in the database; it's a collection of related tables tied together by the Prisma ORM.

**Database Schema (`prisma/schema.prisma`)**:
- **`Gig`**: The parent table containing the title, description, category, search tags, and aggregated stats (rating, order count).
- **`GigPackage`**: Every gig has 3 tiers (Basic, Standard, Premium). This table holds the price, delivery days, and features for each tier.
- **`GigMedia`**: Holds URLs to images/videos uploaded for the gig.
- **`GigFAQ` & `GigRequirement`**: Stores extra metadata requested by the seller.

**The Workflow**:
1. **Creation**: Only users with the `SELLER` role can access `/seller/dashboard` to create gigs. Gigs are sent as a large JSON payload to `POST /api/gigs` which uses Prisma nested writes to save the Gig, Packages, and Media in one transaction.
2. **Browsing**: The main `/dashboard` page fetches from `GET /api/gigs?sort=popular`. The backend sorts gigs by total orders and review counts, allowing the frontend to dynamically generate "Trending Categories" and "Services you may like" based on real database metrics, not static mock data.
3. **Ordering**: A buyer views a gig, selects a package, and creates an `Order`.

### 3. Real-Time Chat (Why a separate server?)
Real-time chat requires persistent WebSocket connections. Because Next.js serverless functions (like those deployed on Vercel) shut down immediately after responding, WebSockets are disconnected instantly. 

To solve this, Earner uses a **dual-deployment strategy**:
1. **The Chat Server (`/chat-server`)**: A stateful Node.js + Express + Socket.io server. It runs continuously on a platform like Render. 
2. **The Frontend**: The Next.js app connects to the chat server via the `NEXT_PUBLIC_CHAT_SERVER_URL` environment variable.

**How Chat Works**:
- **Connection**: The frontend connects to the Socket.io server and passes the user's Firebase JWT token.
- **Global Notifications**: The connection is managed inside `src/context/NotificationContext.tsx` which wraps the entire app. This ensures users receive unread badge updates and toast popups for new messages, even if they aren't on the chat page.
- **Persistence**: When a user sends a message, the Chat Server verifies their token, saves the message to PostgreSQL (via Prisma), and then emits the message directly to the recipient's active socket room.

---

## 📁 Where is What Happening? (Folder Structure)

```text
/
├── prisma/                 
│   └── schema.prisma       # Master database schema (Core Models: User, Gig, Order, Message)
│
├── src/                    # NEXT.JS APPLICATION (FRONTEND & REST APIs)
│   ├── app/                # App Router Structure
│   │   ├── admin/          # Admin dashboard & analytics
│   │   ├── api/            # Serverless REST APIs (Prisma DB access happens here)
│   │   │   ├── gigs/       # Gig creation and fetching logic
│   │   │   └── users/      # Auth syncing logic
│   │   ├── buyer/          # Buyer-specific views
│   │   ├── dashboard/      # The main dynamic marketplace homepage
│   │   ├── gig/            # Public Gig details pages
│   │   ├── messages/       # Real-time chat UI interface
│   │   └── seller/         # Seller-specific views and gig management
│   │
│   ├── components/         # Reusable React UI Components
│   │   ├── auth/           # Login/Register Modals
│   │   ├── gig/            # Gig Cards, Packages, Carousels
│   │   └── layout/         # Navbar, Footer, Conditional Layouts
│   │
│   ├── context/            # Global React State Providers (Auth & Sockets)
│   │
│   └── lib/                # Utility Functions & Configs
│       ├── prisma.ts       # Prisma Client instantiation
│       ├── firebase.ts     # Firebase Client SDK config
│       └── apiAuth.ts      # Server-side JWT token verification helper
│
├── chat-server/            # DEDICATED WEBSOCKET SERVER
│   ├── src/
│   │   ├── index.ts        # Express & Socket.io server entry point
│   │   └── config/         # Firebase Admin & Prisma configs for the server
│   └── package.json        
│
├── next.config.ts          
└── make_admin.ts           # Utility script to promote users to ADMIN role
```

---

## 🛠️ Getting Started Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database URL (e.g. Supabase, Neon)
- Firebase Project configured (with Email & Google Auth enabled)

### 1. Environment Variables
Create a `.env.local` (for Next.js) and a `.env` file in the root directory.

```env
# Next.js (.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-domain.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project"
NEXT_PUBLIC_CHAT_SERVER_URL="http://localhost:3001"

# Server-side Admin Firebase (used in API routes and Chat Server)
FIREBASE_ADMIN_PROJECT_ID="your-project"
FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com"
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"

# Prisma Database (.env)
DATABASE_URL="postgresql://user:pass@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:5432/postgres"
```

### 2. Setup the Database
Push the Prisma schema to your PostgreSQL database to create the necessary tables.
```bash
npx prisma db push
npx prisma generate
```

### 3. Start the Next.js Frontend
```bash
npm install
npm run dev
```
The main application will be running at `http://localhost:3000`.

### 4. Start the Chat Server
In a new terminal window, navigate to the `chat-server` directory and start it.
```bash
cd chat-server
npm install
npm run dev
```
The chat server will run on `http://localhost:3001`.

---

## 🛡️ Admin Privileges
To make yourself an admin to access the `/admin` dashboard routes, you can use the provided root utility script:
```bash
npx tsx make_admin.ts your-email@example.com
```
