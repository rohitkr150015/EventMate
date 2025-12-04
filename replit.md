# EventMate - AI-Powered Event Planning Platform

## Overview
EventMate is a fully portable, local-first AI-powered event planning platform that helps users create and manage events with intelligent recommendations. The platform uses Google's Gemini AI to provide vendor recommendations, budget breakdowns, and event schedules.

## Design Theme: Positivus
The application features a modern dark theme inspired by the Positivus design system:
- **Background**: Dark charcoal (#0B0B0F)
- **Accent Color**: Lime green (#B9FF66)
- **Typography**: Space Grotesk
- **Border Radius**: Rounded corners (1rem)

## Project Architecture

### Tech Stack
- **Frontend**: React with TypeScript, Vite, TailwindCSS, Shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Local email/password authentication with bcrypt
- **AI**: Google Gemini 2.5-flash for recommendations
- **Payments**: Stripe (optional)

### Directory Structure
```
├── client/src/
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and query client
│   ├── pages/          # Page components
│   └── App.tsx         # Main app with routing
├── server/
│   ├── index.ts        # Express server setup
│   ├── routes.ts       # API endpoints
│   ├── storage.ts      # Database operations
│   ├── localAuth.ts    # Local authentication system
│   ├── gemini.ts       # AI recommendation service
│   └── stripeClient.ts # Stripe configuration (optional)
├── shared/
│   └── schema.ts       # Database schema and types
└── replit.md           # This documentation
```

## Local Development Setup

### Prerequisites
1. Node.js 18+ installed
2. PostgreSQL 14+ installed and running
3. npm or yarn package manager

### Step 1: Clone and Install Dependencies
```bash
git clone <repository-url>
cd eventmate
npm install
```

### Step 2: Set Up PostgreSQL Database
```bash
# Create database
createdb eventmate

# Or using psql
psql -U postgres
CREATE DATABASE eventmate;
```

### Step 3: Configure Environment Variables
Create a `.env` file in the project root:
```env
# Database (Required)
DATABASE_URL=postgresql://username:password@localhost:5432/eventmate

# Session (Required - generate a secure random string)
SESSION_SECRET=your-super-secret-key-change-this-in-production

# AI (Optional - for AI recommendations)
GEMINI_API_KEY=your-gemini-api-key

# Stripe (Optional - for payment processing)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# App URL (Optional - defaults to http://localhost:5000)
APP_URL=http://localhost:5000
```

### Step 4: Initialize Database Schema
```bash
npm run db:push
```

### Step 5: Start the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Key Features

### 1. User Authentication
- Email/password registration and login
- Secure password hashing with bcrypt (12 rounds)
- Session-based authentication with HttpOnly cookies
- Role-based access (user, vendor, admin)

### 2. Event Planning
- Create events with wizard interface
- AI-powered recommendations for vendors, schedules, budgets
- Track budget and spending

### 3. Vendor Marketplace
- Browse vendors by category
- Book vendors for events
- Payment processing with Stripe (optional)

### 4. Admin Panel
- User management
- Vendor verification
- Platform statistics

## Recent Changes (December 2025)
- **Migrated to local authentication**: Replaced Replit OIDC with email/password login
- **Applied Positivus design theme**: Dark background with lime green accents
- **Made application portable**: Can now run on any local machine with PostgreSQL
- **Added login/register pages**: Modern auth flow with form validation

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Secret for session encryption |
| `GEMINI_API_KEY` | No | Google Gemini API key for AI features |
| `STRIPE_SECRET_KEY` | No | Stripe secret key for payments |
| `STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key for frontend |
| `APP_URL` | No | Base URL (defaults to http://localhost:5000) |

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout current session
- `GET /api/auth/user` - Get current authenticated user

### Events
- `GET /api/events` - Get user's events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event details
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Vendors
- `GET /api/vendors` - Get all vendors
- `GET /api/vendors?category=:category` - Filter by category
- `GET /api/vendors/:id` - Get vendor details

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/events/:eventId/bookings` - Get event bookings
- `PATCH /api/bookings/:id` - Update booking status

### Payments (Requires Stripe)
- `POST /api/checkout/booking` - Create checkout session
- `POST /api/checkout/verify` - Verify payment
- `GET /api/user/payments` - Get payment history

### AI (Requires Gemini API Key)
- `POST /api/ai/recommendations` - Get AI event recommendations
- `POST /api/ai/vendor-suggestions` - Get AI vendor suggestions

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format: `postgresql://user:pass@host:port/dbname`
- Verify database exists: `psql -l`

### Session/Auth Issues
- Clear browser cookies and try again
- Ensure SESSION_SECRET is set
- Check that sessions table exists in database

### Port Already in Use
```bash
# Find and kill process using port 5000
lsof -i :5000
kill -9 <PID>
```

## User Preferences
- Theme toggle (light/dark mode with Positivus styling)
- Sidebar navigation for authenticated users
