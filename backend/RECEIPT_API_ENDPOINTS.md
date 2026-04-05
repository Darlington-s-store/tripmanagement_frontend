# Receipt System API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Endpoints

### 1. Get All Receipts for User
**Endpoint**: `GET /receipts`

**Description**: Retrieves all receipts generated for the authenticated user

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "RCP_1712192400_8a3kx",
      "booking_id": "BK_1712192400_5m2pq",
      "user_id": "USR_1707123456_9k4jx",
      "receipt_number": "RCP-2026-00008A3K",
      "service_name": "Sunset Beach Resort",
      "booking_type": "hotel",
      "reference_id": "HTL_xxx",
      "check_in_date": "2026-04-07",
      "check_out_date": "2026-04-10",
      "number_of_guests": 2,
      "special_requests": "High floor, ocean view",
      "total_price": 3600.00,
      "base_rate": 3060.00,
      "tax_fee": 540.00,
      "room_type": "Ocean View Deluxe",
      "payment_status": "pending",
      "booking_status": "confirmed",
      "generated_at": "2026-04-05T14:30:00Z",
      "downloaded_at": null,
      "printed_at": null,
      "created_at": "2026-04-05T14:30:00Z",
      "updated_at": "2026-04-05T14:30:00Z"
    }
  ]
}
```

**Error Response** (401 Unauthorized):
```json
{
  "success": false,
  "message": "Not authenticated"
}
```

---

### 2. Get Receipt by ID
**Endpoint**: `GET /receipts/:id`

**Description**: Retrieves a specific receipt by its ID

**Parameters**:
- `id` (string, path) - Receipt ID (e.g., RCP_1712192400_8a3kx)

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response** (200 OK):
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
    "reference_id": "HTL_xxx",
    "check_in_date": "2026-04-07",
    "check_out_date": "2026-04-10",
    "number_of_guests": 2,
    "special_requests": "High floor, ocean view",
    "total_price": 3600.00,
    "base_rate": 3060.00,
    "tax_fee": 540.00,
    "room_type": "Ocean View Deluxe",
    "payment_status": "pending",
    "booking_status": "confirmed",
    "generated_at": "2026-04-05T14:30:00Z",
    "downloaded_at": null,
    "printed_at": null,
    "created_at": "2026-04-05T14:30:00Z",
    "updated_at": "2026-04-05T14:30:00Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Receipt not found or not authorized"
}
```

---

### 3. Get Receipt by Booking ID
**Endpoint**: `GET /receipts/booking/:bookingId`

**Description**: Retrieves receipt associated with a specific booking

**Parameters**:
- `bookingId` (string, path) - Booking ID (e.g., BK_1712192400_5m2pq)

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": { /* receipt object */ }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Receipt not found for this booking"
}
```

---

### 4. Get Receipt Statistics
**Endpoint**: `GET /receipts/stats/overview`

**Description**: Retrieves statistics about user's receipts

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "total_receipts": 15,
    "total_amount": "54000.00",
    "active_months": 3,
    "last_receipt_date": "2026-04-05T14:30:00Z"
  }
}
```

---

### 5. Record Receipt Download
**Endpoint**: `POST /receipts/:id/download`

**Description**: Records that user downloaded a receipt (updates `downloaded_at` timestamp)

**Parameters**:
- `id` (string, path) - Receipt ID

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "RCP_1712192400_8a3kx",
    "downloaded_at": "2026-04-05T15:45:00Z",
    "updated_at": "2026-04-05T15:45:00Z",
    "...rest of receipt data..."
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Receipt not found or not authorized"
}
```

---

### 6. Record Receipt Print
**Endpoint**: `POST /receipts/:id/print`

**Description**: Records that user printed a receipt (updates `printed_at` timestamp)

**Parameters**:
- `id` (string, path) - Receipt ID

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "RCP_1712192400_8a3kx",
    "printed_at": "2026-04-05T15:50:00Z",
    "updated_at": "2026-04-05T15:50:00Z",
    "...rest of receipt data..."
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Receipt not found or not authorized"
}
```

---

### 7. Delete Receipt
**Endpoint**: `DELETE /receipts/:id`

**Description**: Deletes a receipt from the database (admin function)

**Parameters**:
- `id` (string, path) - Receipt ID

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Receipt deleted successfully"
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Receipt not found or not authorized"
}
```

---

## Receipt Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique receipt identifier (RCP_TIMESTAMP_RANDOM) |
| `booking_id` | string | Associated booking ID |
| `user_id` | string | User who owns the receipt |
| `receipt_number` | string | Human-readable receipt number (RCP-YYYY-XXXXXXXX) |
| `service_name` | string | Name of booked service |
| `booking_type` | enum | Type: hotel, guide, activity, transport |
| `reference_id` | string | ID of the booked service |
| `check_in_date` | string | Check-in date (YYYY-MM-DD) |
| `check_out_date` | string | Check-out date (YYYY-MM-DD) |
| `number_of_guests` | int | Number of guests |
| `special_requests` | string | Special requests from booking |
| `total_price` | decimal | Total amount paid |
| `base_rate` | decimal | Base rate before taxes |
| `tax_fee` | decimal | Tax and fees amount |
| `room_type` | string | Room type (for hotel bookings) |
| `payment_status` | enum | pending, completed, failed, refunded |
| `booking_status` | enum | pending, confirmed, cancelled, completed |
| `notes` | string | Additional notes about receipt |
| `generated_at` | timestamp | When receipt was generated |
| `downloaded_at` | timestamp | When user downloaded receipt |
| `printed_at` | timestamp | When user printed receipt |
| `created_at` | timestamp | Record creation timestamp |
| `updated_at` | timestamp | Record last update timestamp |

---

## Common Use Cases

### Display Receipt in the Frontend
```javascript
// Fetch receipt for a booking
const receipt = await receiptsService.getReceiptByBookingId(bookingId);

// Open receipt view modal
<ReceiptView receipt={receipt} onClose={() => setIsOpen(false)} />
```

### Track User Receipt Usage
```javascript
// Get statistics
const stats = await receiptsService.getReceiptStats();
console.log(`User has ${stats.total_receipts} receipts`);
console.log(`Total spent: GH₵${stats.total_amount}`);
```

### Download Receipt as PDF
```javascript
// When user clicks download
const receipt = await receiptsService.getReceiptByBookingId(bookingId);

// Track the download
await receiptsService.recordDownload(receipt.id);

// Generate and download PDF
const html = receiptsService.exportReceiptAsHTML(receipt);
const blob = new Blob([html], { type: 'text/html' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `receipt-${receipt.receipt_number}.pdf`;
a.click();
```

### Print Receipt
```javascript
// When user clicks print
const receipt = await receiptsService.getReceiptByBookingId(bookingId);

// Track the print
await receiptsService.recordPrint(receipt.id);

// Browser print dialog opens
window.print();
```

---

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Reference ID, date, and price are required | Missing required booking fields |
| 401 | Not authenticated | Missing or invalid JWT token |
| 404 | Receipt not found or not authorized | Receipt doesn't exist or user not authorized |
| 404 | Receipt not found for this booking | No receipt generated for booking |
| 500 | Internal server error | Database or server error |

---

## Rate Limiting

All endpoints are subject to general API rate limiting:
- **15-minute window**: 100 requests per IP
- **Custom limits**: Apply to prevent abuse

---

## Response Format

All responses follow the standard format:

**Success Response**:
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Example Workflow

```
1. User creates booking
   POST /bookings → Receipt generated automatically

2. User views bookings
   GET /bookings → List shows all bookings

3. User clicks "View Receipt"
   GET /receipts/booking/{bookingId} → Receipt data returned

4. User opens receipt in modal
   ReceiptView component displays receipt

5. User clicks "Download"
   POST /receipts/{id}/download → Download tracked
   Browser downloads PDF

6. User clicks "Print"
   POST /receipts/{id}/print → Print tracked
   Browser print dialog opens

7. User views statistics
   GET /receipts/stats/overview → Stats returned
```
