import pool from '../config/database.js';
import { UnauthorizedError, NotFoundError, ValidationError } from '../utils/errors.js';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '../utils/email.js';

export async function createBooking(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { tripId, bookingType, referenceId, checkInDate, checkOutDate, totalPrice, numberOfGuests, specialRequests, hotelId, roomId, startDate, endDate, guests } = req.body;

  // Support both frontend naming conventions
  const refId = referenceId || hotelId;
  const bType = bookingType || 'hotel';
  const inDate = checkInDate || startDate;
  const outDate = checkOutDate || endDate;
  const price = totalPrice;
  const guestCount = numberOfGuests || guests || 1;

  if (!refId || !inDate || !price) {
    throw new ValidationError('Reference ID, date, and price are required');
  }

  // Hotels usually require a checkout date, but transport/activities/guides might not
  const finalOutDate = outDate || inDate;

  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO bookings (id, user_id, trip_id, booking_type, reference_id, room_id, check_in_date, check_out_date, total_price, number_of_guests, special_requests, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [uuidv4(), req.user.id, tripId || null, bType, refId, roomId || null, inDate, finalOutDate, price, guestCount, specialRequests || null, 'pending']
    );

    const booking = result.rows[0];

    // Fetch details for email
    const userResult = await client.query('SELECT full_name, email FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    let serviceName = 'Your Travel Service';
    if (bType === 'hotel') {
      const h = await client.query('SELECT name FROM hotels WHERE id = $1', [refId]);
      if (h.rows[0]) serviceName = h.rows[0].name;
    } else if (bType === 'guide') {
      const g = await client.query('SELECT name FROM tour_guides WHERE id = $1', [refId]);
      if (g.rows[0]) serviceName = g.rows[0].name;
    } else if (bType === 'activity') {
      const a = await client.query('SELECT name FROM activities WHERE id = $1', [refId]);
      if (a.rows[0]) serviceName = a.rows[0].name;
    } else if (bType === 'transport') {
      const t = await client.query('SELECT name FROM transport_services WHERE id = $1', [refId]);
      if (t.rows[0]) serviceName = t.rows[0].name;
    }

    // Create In-App Notification
    await client.query(
      'INSERT INTO notifications (id, user_id, type, message) VALUES ($1, $2, $3, $4)',
      [uuidv4(), req.user.id, 'booking_confirmation', `Booking confirmed for ${serviceName} on ${new Date(inDate).toLocaleDateString()}`]
    );

    // Send Confirmation Email
    const bookingHtml = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #f9fafb; border-radius: 12px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #2D3FE6; margin: 0; font-size: 24px;">Booking Confirmed! ✅</h1>
          <p style="color: #666;">Your reservation with TripEase Ghana is secured.</p>
        </div>
        
        <div style="background-color: white; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden; margin-bottom: 24px;">
          <div style="background-color: #2D3FE6; padding: 15px 20px;">
            <h2 style="color: white; margin: 0; font-size: 18px;">Reservation Summary</h2>
          </div>
          <div style="padding: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #666;">Service</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; text-align: right;">${serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #666;">Date</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; text-align: right;">${new Date(inDate).toLocaleDateString()}</td>
              </tr>
              ${bType === 'hotel' ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #666;">Checkout</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; text-align: right;">${new Date(finalOutDate).toLocaleDateString()}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #666;">Guests</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; text-align: right;">${guestCount} travellers</td>
              </tr>
              <tr>
                <td style="padding: 15px 0 0 0; color: #666; font-size: 18px;">Total Price</td>
                <td style="padding: 15px 0 0 0; color: #2D3FE6; font-size: 20px; font-weight: bold; text-align: right;">GH₵${price}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${req.get('origin') || 'http://localhost:5173'}/dashboard/bookings" 
             style="background-color: #2D3FE6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            View Booking in Dashboard
          </a>
        </div>
        
        <p style="font-size: 14px; color: #999; text-align: center; line-height: 1.5;">
          If you didn't make this reservation, please contact our support team immediately. <br/>
          &copy; ${new Date().getFullYear()} TripEase Ghana. All rights reserved.
        </p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: `Booking Confirmed: ${serviceName} | TripEase Ghana`,
        message: `Your booking for ${serviceName} has been confirmed for ${new Date(inDate).toLocaleDateString()}. Total: GH₵${price}`,
        html: bookingHtml
      });
    } catch (emailErr) {
      console.error('Booking confirmation email failed:', emailErr);
    }

    res.status(201).json({ success: true, data: booking });
  } finally {
    client.release();
  }
}

export async function getUserBookings(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT b.id, b.trip_id, b.booking_type, b.reference_id, b.room_id, b.check_in_date, b.check_out_date, 
              b.number_of_guests, b.total_price, b.special_requests, b.status, b.created_at,
              COALESCE(h.name, g.name, a.name, t.name) as service_name,
              hr.room_type
       FROM bookings b 
       LEFT JOIN hotels h ON b.booking_type = 'hotel' AND b.reference_id = h.id
       LEFT JOIN hotel_rooms hr ON b.room_id = hr.id
       LEFT JOIN tour_guides g ON b.booking_type = 'guide' AND b.reference_id = g.id
       LEFT JOIN activities a ON b.booking_type = 'activity' AND b.reference_id = a.id
       LEFT JOIN transport_services t ON b.booking_type = 'transport' AND b.reference_id = t.id
       WHERE b.user_id = $1 
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function getBookingById(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (result.rows.length === 0) throw new NotFoundError('Booking not found');
    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function cancelBooking(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING id, status',
      ['cancelled', id, req.user.id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Booking not found or not authorized');
    res.json({ success: true, message: 'Booking cancelled', data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function updateBooking(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { id } = req.params;
  const { status } = req.body;

  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING id, status',
      [status, id, req.user.id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Booking not found');
    res.json({ success: true, message: 'Booking updated', data: result.rows[0] });
  } finally {
    client.release();
  }
}
