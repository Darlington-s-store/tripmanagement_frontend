# TripEase Ghana Backend

Node.js/Express backend API for TripEase Ghana with PostgreSQL database hosted on Neon.

## Prerequisites

- Node.js 18+ (https://nodejs.org)
- npm or pnpm
- PostgreSQL account with Neon (https://neon.tech)

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
# or
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Neon database connection string:

```bash
cp .env.example .env
```

Edit `.env` and add:
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `PORT`: Server port (default: 3001)
- `CORS_ORIGIN`: Frontend URL (default: http://localhost:5173)

Example:
```
DATABASE_URL=postgresql://user:password@ep-xyz.us-east-1.neon.tech/tripease?sslmode=require
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRE=7d
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Run Database Migrations

Create the database tables:

```bash
npm run migrate
```

This will execute all SQL migration files in `src/migrations/` and create the necessary tables.

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 5. Verify Server is Running

Check the health endpoint:
```bash
curl http://localhost:3001/health
```

You should see:
```json
{"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login
- `GET /api/auth/profile` - Get current user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Trips
- `POST /api/trips` - Create trip (protected)
- `GET /api/trips` - Get user trips (protected)
- `GET /api/trips/:id` - Get trip details (protected)
- `PUT /api/trips/:id` - Update trip (protected)
- `DELETE /api/trips/:id` - Delete trip (protected)
- `POST /api/trips/:id/itinerary` - Add itinerary day (protected)

### Hotels
- `GET /api/hotels` - Search hotels (public)
- `GET /api/hotels/:id` - Get hotel details (public)
- `POST /api/hotels` - Create hotel (protected)
- `PUT /api/hotels/:id` - Update hotel (protected)
- `DELETE /api/hotels/:id` - Delete hotel (protected)

### Guides
- `GET /api/guides` - Search guides (public)
- `GET /api/guides/:id` - Get guide details (public)
- `POST /api/guides` - Create guide (protected)
- `PUT /api/guides/:id` - Update guide (protected)
- `DELETE /api/guides/:id` - Delete guide (protected)

### Bookings
- `POST /api/bookings` - Create booking (protected)
- `GET /api/bookings` - Get user bookings (protected)
- `GET /api/bookings/:id` - Get booking details (protected)
- `PUT /api/bookings/:id/status` - Update booking status (protected)
- `PUT /api/bookings/:id/cancel` - Cancel booking (protected)

### Reviews
- `POST /api/reviews` - Create review (protected)
- `GET /api/reviews` - Get user reviews (protected)
- `GET /api/reviews/booking/:id` - Get booking reviews (public)
- `PUT /api/reviews/:id` - Update review (protected)
- `DELETE /api/reviews/:id` - Delete review (protected)

## Testing with Postman

1. Import the API endpoints into Postman
2. For protected routes, get a token from `/api/auth/login`
3. Add `Authorization: Bearer <token>` header to protected requests

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm run typecheck` - Type check without building
- `npm run migrate` - Run database migrations

## Database Schema

Tables created:
- users
- providers
- trips
- itineraries
- hotels
- hotel_rooms
- tour_guides
- activities
- bookings
- payments
- reviews
- refunds
- disputes
- notifications
- admin_logs

See `src/migrations/001_init_schema.sql` for full schema details.

## Error Handling

All errors return JSON with appropriate HTTP status codes:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common status codes:
- 200: Success
- 201: Created
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 409: Conflict
- 500: Server error

## Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure `CORS_ORIGIN` to your frontend domain
4. Use a managed PostgreSQL database (Neon recommended)
5. Deploy on platforms like Render, Railway, or Vercel

## Next Steps

1. Configure frontend at `../VITE_API_URL=http://localhost:3001/api`
2. Run frontend development server
3. Test authentication and API integration
4. Build admin pages to manage content
5. Set up payment processing (Stripe, etc.)
