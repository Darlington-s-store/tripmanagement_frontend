# Receipt System Backend Setup Guide

## Database Changes

### 1. Receipts Table Added
- **Migration File**: `019_add_receipts_table.sql`
- **Table**: `receipts`
- **Purpose**: Stores all generated receipts for bookings

**Key Fields**:
- `id` (VARCHAR 50) - Primary key for receipt
- `booking_id` (VARCHAR 50) - Links to bookings table
- `user_id` (VARCHAR 50) - User who owns the receipt
- `receipt_number` (VARCHAR 100) - Human-readable receipt number (RCP-2026-XXXXXXXX)
- `service_name` (VARCHAR 255) - Name of booked service
- `booking_type` (VARCHAR 50) - Type of booking (hotel, guide, activity, transport)
- `total_price` (DECIMAL 10,2) - Total amount paid
- `base_rate` (DECIMAL 10,2) - Base rate before taxes
- `tax_fee` (DECIMAL 10,2) - Tax and fee amount
- `generated_at` (TIMESTAMP) - When receipt was generated
- `downloaded_at` (TIMESTAMP) - When receipt was downloaded by user
- `printed_at` (TIMESTAMP) - When receipt was printed by user

**Indexes**: 
- `idx_receipts_user_id` - Fast lookup by user_id
- `idx_receipts_booking_id` - Fast lookup by booking_id
- `idx_receipts_created_at` - Sort by creation date

---

## Backend Components Added

### 1. ID Generator (`backend/src/utils/idGenerator.js`)
**New Function**: `generateReceiptId()`
- Generates IDs in format: `RCP_TIMESTAMP_RANDOM`
- Example: `RCP_1712192400_8a3kx`

```javascript
export const generateReceiptId = () => generateId('RCP');
```

### 2. Receipt Controller (`backend/src/controllers/receiptController.js`)

**Exported Functions**:

#### `generateReceipt(bookingId, bookingData)`
- Generates receipt for a booking after it's created
- Automatically called by bookingController after booking confirmation
- Returns receipt object with all details

#### `getUserReceipts(req, res)`
- GET endpoint - Returns all receipts for authenticated user
- Sorted by creation date (newest first)

#### `getReceiptById(req, res)`
- GET endpoint - Returns specific receipt by ID
- Verifies user authorization

#### `getReceiptByBookingId(req, res)`
- GET endpoint - Returns receipt for a specific booking
- Uses booking ID to find associated receipt

#### `recordReceiptDownload(req, res)`
- POST endpoint - Records when user downloads receipt
- Updates `downloaded_at` timestamp in database

#### `recordReceiptPrint(req, res)`
- POST endpoint - Records when user prints receipt
- Updates `printed_at` timestamp in database

#### `getReceiptStats(req, res)`
- GET endpoint - Returns receipt statistics for user
- Returns: total_receipts, total_amount, active_months, last_receipt_date

#### `deleteReceipt(req, res)`
- DELETE endpoint - Removes receipt from database

### 3. Receipt Routes (`backend/src/routes/receipts.js`)

**Route Structure**:
```
GET    /api/receipts                    - Get all user receipts
GET    /api/receipts/:id                - Get receipt by ID
GET    /api/receipts/booking/:bookingId - Get receipt by booking ID
GET    /api/receipts/stats/overview     - Get receipt statistics
POST   /api/receipts/:id/download       - Record download
POST   /api/receipts/:id/print          - Record print
DELETE /api/receipts/:id                - Delete receipt
```

All routes require authentication via `authenticateToken` middleware.

### 4. Updated Booking Controller
- Imports and uses `generateReceipt()` after booking creation
- Automatically generates receipt when booking is confirmed
- Includes receipt in booking response

---

## API Response Examples

### Generate Receipt (Automatic on Booking)
```json
{
  "success": true,
  "data": {
    "id": "RCP_1712192400_8a3kx",
    "booking_id": "BK_1712192400_5m2pq",
    "user_id": "USR_1707123456_9k4jx",
    "receipt_number": "RCP-2026-00008A3K",
    "service_name": "Sunset Beach Resort",
    "booking_type": "hotel",
    "total_price": 3600.00,
    "base_rate": 3060.00,
    "tax_fee": 540.00,
    "checkout_date": "2026-04-10",
    "check_in_date": "2026-04-07",
    "number_of_guests": 2,
    "generated_at": "2026-04-05T14:30:00Z",
    "downloaded_at": null,
    "printed_at": null
  }
}
```

### Get All User Receipts
```json
{
  "success": true,
  "data": [
    { /* receipt 1 */ },
    { /* receipt 2 */ },
    { /* receipt 3 */ }
  ]
}
```

### Record Download
```json
{
  "success": true,
  "data": {
    "...receipt details...",
    "downloaded_at": "2026-04-05T15:45:00Z"
  }
}
```

---

## Database Migration Instructions

### Running Migrations
1. migration runs automatically on server startup via `backend/src/migrations/run.js`
2. Or manually run:
```bash
cd backend
npm run migrate
```

### Migration File: `019_add_receipts_table.sql`
- Creates `receipts` table with all fields
- Creates indexes for performance
- Adds foreign key constraint to bookings table

---

## Integration Points

### 1. Booking Creation Flow
```
1. User creates booking via POST /api/bookings
2. bookingController.createBooking() executes
3. Booking inserted into database
4. generateReceipt() called automatically
5. Receipt generated and inserted
6. Email sent to user
7. Response includes receipt data
```

### 2. Receipt Viewing Flow
```
1. User views booking detail or bookings list
2. Click "View Receipt" button
3. Frontend calls GET /api/receipts/booking/:bookingId
4. Receipt data returned from database
5. ReceiptView component displays receipt
6. User can print/download
7. Frontend calls POST /api/receipts/:id/print or /download
8. Backend records timestamp
```

---

## Frontend Integration

### Services (`src/services/receipts.ts`)

**Methods**:
- `getUserReceipts()` - Fetch all receipts
- `getReceiptById(id)` - Fetch specific receipt
- `getReceiptByBookingId(bookingId)` - Fetch receipt for booking
- `recordDownload(id)` - Track download
- `recordPrint(id)` - Track print
- `getReceiptStats()` - Get user statistics
- `exportReceiptAsHTML()` - Generate HTML for printing/PDF

### Components Using Receipt System

1. **ReceiptView.tsx** - Modal component
   - Displays receipt
   - Print button → calls `recordPrint()`
   - Download button → calls `recordDownload()`
   
2. **BookingDetail.tsx** - Booking detail page
   - "View Receipt" button opens ReceiptView
   
3. **UserBookings.tsx** - Bookings list
   - "Receipt" button on each booking card
   
4. **BookingConfirmation.tsx** - After booking
   - Immediate access to receipt buttons

---

## SQL Queries Examples

### Get user's receipts
```sql
SELECT * FROM receipts 
WHERE user_id = 'USR_1707123456_9k4jx'
ORDER BY created_at DESC;
```

### Get receipt details
```sql
SELECT r.*, b.check_in_date, b.check_out_date, b.total_price
FROM receipts r
LEFT JOIN bookings b ON r.booking_id = b.id
WHERE r.id = 'RCP_1712192400_8a3kx';
```

### Get download/print statistics
```sql
SELECT 
  COUNT(*) as total_receipts,
  COUNT(downloaded_at) as downloaded_count,
  COUNT(printed_at) as printed_count
FROM receipts 
WHERE user_id = 'USR_1707123456_9k4jx';
```

---

## Error Handling

### No Receipt Found
```json
{
  "success": false,
  "message": "Receipt not found or not authorized"
}
```

### Unauthorized Access
```json
{
  "success": false,
  "message": "Not authenticated"
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Reference ID, date, and price are required"
}
```

---

## Monitoring & Logging

### Backend Logs
- `✅ Receipt generated: RCP-2026-00008A3K` - Successful generation
- `❌ Receipt generation failed: [error message]` - Generation error
- `✅ Receipt download recorded: RCP_1712192400_8a3kx` - Download tracked
- `✅ Receipt print recorded: RCP_1712192400_8a3kx` - Print tracked

### Database Monitoring
- Check receipts table row count
- Monitor `downloaded_at` and `printed_at` NULL vs populated
- Track receipt generation rate per user/booking type

---

## Testing the Receipt System

### 1. Create a Booking
```bash
curl -X POST http://localhost:3001/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingType": "hotel",
    "referenceId": "HTL_xxx",
    "checkInDate": "2026-04-07",
    "checkOutDate": "2026-04-10",
    "totalPrice": 3600,
    "numberOfGuests": 2
  }'
```

### 2. Get Receipt by Booking ID
```bash
curl http://localhost:3001/api/receipts/booking/BK_xxx \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Record Download
```bash
curl -X POST http://localhost:3001/api/receipts/RCP_xxx/download \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Record Print
```bash
curl -X POST http://localhost:3001/api/receipts/RCP_xxx/print \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Performance Considerations

1. **Indexes**: Receipt lookups optimized with indexes on user_id, booking_id, created_at
2. **Pagination**: Consider adding pagination for users with many receipts
3. **Caching**: Receipt data can be cached after generation (receipts are immutable)
4. **Archival**: Old receipts can be archived to separate table for performance

---

## Future Enhancements

1. **Email PDF Attachments**: Attach receipt PDF to confirmation email
2. **Receipt Templates**: Support multiple receipt templates by business type
3. **Refund Receipts**: Generate credit notes for cancelled bookings
4. **Receipt Search**: Add full-text search for receipt details
5. **Export**: Bulk export receipts as CSV/Excel
6. **Tax Reports**: Generate monthly/yearly tax summaries
