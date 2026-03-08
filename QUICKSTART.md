# TripEase Ghana - Quick Start Guide

## Prerequisites
- Node.js 16+ installed
- npm or yarn
- Neon PostgreSQL account and database created

## 1. Clone & Setup

```bash
# Navigate to project directory
cd tripease-ghana

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
npm install
```

## 2. Configure Environment

### Backend Configuration
```bash
# Create .env file in backend directory
cd backend
cp .env.example .env

# Edit .env with your Neon PostgreSQL credentials
# DATABASE_URL=postgresql://user:password@project.neon.tech/database
# JWT_SECRET=your-secret-key-here
```

### Frontend Configuration
```bash
# Create .env file in frontend root
cp .env.example .env

# Default is already set to:
# VITE_API_URL=http://localhost:3001/api
```

## 3. Initialize Database

```bash
# From backend directory
npm run migrate

# This creates all tables from migrations/001_init_schema.sql
```

## 4. Start Services

### Terminal 1 - Backend
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

### Terminal 2 - Frontend
```bash
npm run dev
# Runs on http://localhost:5173
```

## 5. Test the Application

### User Flow
1. Go to http://localhost:5173
2. Click "Register" to create account
3. Login with credentials
4. Create a trip at /trips/new
5. Search hotels at /hotels
6. Complete booking flow at /checkout
7. View dashboard at /dashboard

### Admin Flow
1. Go to http://localhost:5173/admin/login
2. Login with admin credentials
3. View admin dashboard at /admin
4. Manage users, listings, approvals, etc.

## Available Endpoints

### Authentication
- POST `/api/auth/register` - Create account
- POST `/api/auth/login` - Login user
- POST `/api/auth/admin-login` - Login admin

### Trips
- GET `/api/trips` - Get user's trips
- POST `/api/trips` - Create trip
- GET `/api/trips/:id` - Get trip details
- PUT `/api/trips/:id` - Update trip
- DELETE `/api/trips/:id` - Delete trip

### Hotels
- GET `/api/hotels` - Search hotels
- GET `/api/hotels/:id` - Get hotel details

### Bookings
- GET `/api/bookings` - Get user's bookings
- POST `/api/bookings` - Create booking
- GET `/api/bookings/:id` - Get booking details
- DELETE `/api/bookings/:id` - Cancel booking

### Reviews
- GET `/api/reviews` - Get reviews
- POST `/api/reviews` - Create review
- DELETE `/api/reviews/:id` - Delete review

### Guides
- GET `/api/guides` - Search guides
- GET `/api/guides/:id` - Get guide details

## Default Test Credentials

### User Account
```
Email: user@example.com
Password: password123
```

### Admin Account
```
Email: admin@example.com
Password: admin123
```

## Common Commands

```bash
# Backend
npm run dev         # Start dev server
npm run build       # Build TypeScript
npm run migrate     # Run database migrations

# Frontend
npm run dev         # Start dev server
npm run build       # Build production
```

## Testing with Postman/Thunder Client

1. Register a user:
```
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "full_name": "Test User"
}
```

2. Login:
```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

3. Copy the returned `token` and use in subsequent requests:
```
GET http://localhost:3001/api/trips
Authorization: Bearer {token}
```

## Troubleshooting

### Database Connection Error
- Verify DATABASE_URL in .env
- Check Neon connection string format
- Ensure network connection to Neon

### Port Already in Use
```bash
# Change port in backend src/server.ts
# Or kill process using port 3001
lsof -ti:3001 | xargs kill -9
```

### CORS Errors
- Ensure backend CORS_ORIGIN matches frontend URL
- Default is http://localhost:5173

### JWT Token Expired
- Refresh token automatically handled by AuthContext
- Check JWT_EXPIRE setting in .env

## Next Steps

1. Complete admin pages following user dashboard pattern
2. Add payment integration (Stripe/Paystack)
3. Implement email notifications
4. Add image uploads
5. Deploy to production (Vercel frontend, Railway/Render backend)

## Documentation

- Full API documentation: `/backend/README.md`
- Complete setup guide: `/SETUP.md`
- Implementation status: `/IMPLEMENTATION_STATUS.md`
- Project completion status: `/PROJECT_COMPLETION_STATUS.md`
