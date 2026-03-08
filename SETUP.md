# TripEase Ghana - Full Stack Setup Guide

Complete setup instructions for the TripEase Ghana travel booking platform.

## Project Structure

```
tripease-ghana/
├── backend/                 # Node.js/Express API (NEW)
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # API route handlers
│   │   ├── middleware/    # Auth, error handling
│   │   ├── migrations/    # Database schema
│   │   ├── routes/        # API endpoints
│   │   ├── utils/         # JWT, password, errors
│   │   ├── app.ts         # Express app setup
│   │   └── server.ts      # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example       # Environment variables template
│   ├── .gitignore
│   └── README.md          # Backend documentation
├── src/                     # React frontend
│   ├── services/          # API client services (NEW)
│   ├── context/           # AuthContext (NEW)
│   ├── pages/
│   ├── components/
│   └── ...
├── .env.example           # Frontend env template (NEW)
└── ...
```

## Prerequisites

- Node.js 18+ (https://nodejs.org)
- npm or pnpm
- Neon PostgreSQL account (https://neon.tech)
- Git

## Step 1: Database Setup (Neon)

1. Go to https://neon.tech and sign up
2. Create a new project named "tripease-ghana"
3. Create a database named "tripease"
4. Copy the connection string (format: `postgresql://user:password@host/database?sslmode=require`)
5. Keep this string safe - you'll need it for backend configuration

## Step 2: Backend Setup

### 2.1 Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
DATABASE_URL=postgresql://YOUR_NEON_CONNECTION_STRING
JWT_SECRET=your-super-secret-key-generate-a-strong-random-string
JWT_EXPIRE=7d
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 2.2 Install Backend Dependencies

```bash
npm install
# or
pnpm install
```

### 2.3 Run Database Migrations

```bash
npm run migrate
```

This creates all necessary tables in your Neon database.

### 2.4 Start Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

You should see:
```
Server running on port 3001
API available at http://localhost:3001/api
```

## Step 3: Frontend Setup

### 3.1 Configure Frontend Environment

In the root directory, create `.env.local`:

```bash
cp .env.example .env.local
```

The default value points to local backend:
```
VITE_API_URL=http://localhost:3001/api
```

### 3.2 Install Frontend Dependencies

```bash
npm install
# or
pnpm install
```

### 3.3 Start Frontend Development Server

In a new terminal:

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Step 4: Test the Setup

### 4.1 Test Backend

```bash
# Check server health
curl http://localhost:3001/health

# Should return:
# {"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
```

### 4.2 Test Frontend

Visit `http://localhost:5173` and:
1. Click "Register" to create an account
2. Fill in your details and submit
3. You should be logged in and redirected to dashboard
4. Go to `/admin/login` to test admin login (use admin credentials if you've set them up)

### 4.3 Test API Integration

1. Register a new user account
2. Go to Dashboard and check if your profile loads
3. Try creating a trip in Trip Planning
4. Search for hotels

## Available Features

### Authentication
- ✅ User registration and login
- ✅ Admin login (separate endpoint)
- ✅ JWT-based session management
- ✅ Profile management

### Core APIs
- ✅ Trip management (create, read, update, delete)
- ✅ Itinerary builder (add days to trips)
- ✅ Hotel search and booking
- ✅ Guide search and booking
- ✅ Booking management
- ✅ Review system
- ✅ User profiles

## Next Steps to Complete the App

1. **Finish Frontend Pages** (In Progress)
   - Trip planning UI with itinerary builder
   - Hotel search and booking flows
   - Guide booking system
   - User dashboards (profile, bookings, reviews, settings, itineraries)
   - Admin dashboard with management pages

2. **Complete Admin Pages** (TODO)
   - User management
   - Listing approvals
   - Dispute resolution
   - Refund management
   - Analytics and reporting

3. **Provider Dashboard** (Optional)
   - Provider profile and verification
   - Listing management
   - Booking management
   - Analytics

4. **Additional Features** (TODO)
   - Payment processing (Stripe integration)
   - Email notifications
   - SMS notifications
   - Advanced search and filters
   - Wishlist/favorites
   - Ratings and recommendations

## Useful Commands

### Backend
```bash
cd backend

# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build TypeScript
npm start            # Run production build

# Database
npm run migrate      # Run migrations

# Other
npm run typecheck    # Type check without building
```

### Frontend
```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production

# Preview
npm run preview      # Preview production build

# Testing
npm run test         # Run tests
npm run test:watch   # Watch mode testing

# Linting
npm run lint         # Run ESLint
```

## Troubleshooting

### Backend won't connect to database
- Verify DATABASE_URL is correct
- Check if Neon database is active
- Ensure firewall allows connections
- Try restarting the backend

### Frontend can't reach backend
- Check if backend is running on port 3001
- Verify VITE_API_URL is correct
- Check browser console for CORS errors
- Clear browser cache and reload

### Database migration fails
- Ensure DATABASE_URL includes `?sslmode=require` for Neon
- Check that migrations folder exists
- Verify Neon account has database created
- Try running `npm run migrate` again

### Authentication not working
- Check JWT_SECRET is set in backend .env
- Verify token is being stored in sessionStorage
- Check browser dev tools Network tab for auth errors
- Clear sessionStorage and try logging in again

## Deployment

### Deploy Backend

**Option 1: Render (Recommended)**
1. Create account at https://render.com
2. Connect GitHub repository
3. Create new Web Service
4. Set environment variables from backend/.env
5. Deploy

**Option 2: Railway**
1. Create account at https://railway.app
2. Connect GitHub
3. Add environment variables
4. Deploy

### Deploy Frontend

**Vercel (Recommended)**
1. Go to https://vercel.com
2. Import this GitHub repository
3. Set `VITE_API_URL` to your production backend URL
4. Deploy

**Other platforms:** Netlify, Firebase Hosting, etc.

## Support

For issues:
1. Check the logs in backend terminal
2. Check browser console for frontend errors
3. Verify database connection
4. Check API endpoints in backend README.md

## Database Schema Documentation

See `backend/src/migrations/001_init_schema.sql` for:
- Table structure
- Field definitions
- Indexes
- Relationships

## API Documentation

See `backend/README.md` for:
- Full endpoint list
- Request/response formats
- Authentication requirements
- Error codes

Comprehensive API documentation: `backend/README.md`

---

**Last Updated:** January 2024
**Status:** Core backend and API integration complete. Frontend pages in development.
