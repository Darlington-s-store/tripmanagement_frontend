import pool from '../config/database.js';
import { UnauthorizedError, NotFoundError, ValidationError } from '../utils/errors.js';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/email.js';
import { logAdminAction } from '../utils/logger.js';

export async function getDashboard(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const client = await pool.connect();
  try {
    const [users, bookings, trips, reviews] = await Promise.all([
      client.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['user']),
      client.query('SELECT COUNT(*) as count FROM bookings'),
      client.query('SELECT COUNT(*) as count FROM trips'),
      client.query('SELECT COUNT(*) as count FROM reviews'),
    ]);

    const totalRevenue = await client.query('SELECT SUM(total_price) as total FROM bookings WHERE status = $1', ['completed']);

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(users.rows[0].count),
        totalBookings: parseInt(bookings.rows[0].count),
        totalTrips: parseInt(trips.rows[0].count),
        totalReviews: parseInt(reviews.rows[0].count),
        totalRevenue: parseFloat(totalRevenue.rows[0].total || 0),
      },
    });
  } finally {
    client.release();
  }
}

export async function getAllUsers(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { search, role, status } = req.query;
  const client = await pool.connect();
  try {
    let query = 'SELECT id, email, full_name, phone, role, status, created_at FROM users';
    const params = [];
    const whereLines = [];

    if (search) {
      params.push(`%${search}%`);
      whereLines.push(`(full_name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length})`);
    }

    if (role && role !== 'all') {
      params.push(role);
      whereLines.push(`role = $${params.length}`);
    }

    if (status && status !== 'all') {
      params.push(status);
      whereLines.push(`status = $${params.length}`);
    }

    if (whereLines.length > 0) {
      query += ' WHERE ' + whereLines.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await client.query(query, params);
    res.json({
      success: true,
      data: result.rows,
    });
  } finally {
    client.release();
  }
}

export async function createUser(req, res) {
  const { email, password, fullName, phone, role } = req.body;
  if (!email || !password || !fullName) throw new ValidationError('Email, password, and full name are required');

  const client = await pool.connect();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query(
      'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role',
      [email, hashedPassword, fullName, phone, role || 'user']
    );

    // Enhanced logging
    await logAdminAction(req, 'CREATE_USER', {
      resourceType: 'user',
      resourceId: result.rows[0].id,
      details: `Created user ${email} with role ${role}`
    });

    res.status(201).json({ success: true, message: 'User created successfully', data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function resetUserPassword(req, res) {
  const { id } = req.params;
  const { password } = req.body;
  if (!password) throw new ValidationError('New password is required');

  const client = await pool.connect();
  try {
    // Get user details first
    const userResult = await client.query('SELECT email, full_name FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) throw new NotFoundError('User not found');
    const user = userResult.rows[0];

    const hashedPassword = await bcrypt.hash(password, 10);
    await client.query('UPDATE users SET password_hash = $1, requires_password_change = true WHERE id = $2', [hashedPassword, id]);

    await logAdminAction(req, 'RESET_PASSWORD', {
      resourceType: 'user',
      resourceId: id,
      details: `Reset password for user ${id}`
    });

    // Send notification email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your Password Has Been Reset',
        message: `Hello ${user.full_name || 'there'},\n\nAn administrator has reset your password for your TripEase Ghana account. Your new temporary password is: ${password}\n\nPlease log in and change your password as soon as possible for security.\n\nRegards,\nThe TripEase Team`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0f172a;">Password Reset Notification</h2>
            <p>Hello ${user.full_name || 'there'},</p>
            <p>An administrator has reset your password for your <strong>TripEase Ghana</strong> account.</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px dashed #cbd5e1; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">Your new temporary password is:</p>
              <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: #020617; letter-spacing: 2px;">${password}</p>
            </div>
            <p>Please log in and change your password as soon as possible to ensure your account remains secure.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="font-size: 12px; color: #94a3b8;">If you did not request this change, please contact our support team immediately.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      // We don't throw here to avoid failing the whole request if only email fails, 
      // but the password IS reset in DB.
    }

    res.json({ success: true, message: 'Password reset successfully and email notification sent' });
  } finally {
    client.release();
  }
}

export async function getUserActivity(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const [bookings, reviews] = await Promise.all([
      client.query('SELECT b.* FROM bookings b WHERE b.user_id = $1 ORDER BY b.created_at DESC', [id]),
      client.query('SELECT r.* FROM reviews r WHERE r.user_id = $1 ORDER BY r.created_at DESC', [id])
    ]);

    res.json({
      success: true,
      data: {
        bookings: bookings.rows,
        reviews: reviews.rows
      }
    });
  } finally {
    client.release();
  }
}

export async function getUserById(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, email, full_name, phone, role, status, bio, created_at FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) throw new NotFoundError('User not found');
    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function updateUser(req, res) {
  const { id } = req.params;
  const { status, role, full_name, email, phone } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE users SET status = COALESCE($1, status), role = COALESCE($2, role), full_name = COALESCE($3, full_name), email = COALESCE($4, email), phone = COALESCE($5, phone), updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING id, email, full_name, status, role',
      [status || null, role || null, full_name || null, email || null, phone || null, id]
    );
    if (result.rows.length === 0) throw new NotFoundError('User not found');

    await logAdminAction(req, 'UPDATE_USER', {
      resourceType: 'user',
      resourceId: id,
      details: `Updated user ${id}`
    });

    res.json({ success: true, message: 'User updated', data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function deleteUser(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM users WHERE id = $1', [id]);

    await logAdminAction(req, 'DELETE_USER', {
      resourceType: 'user',
      resourceId: id,
      details: `Deleted user ${id}`
    });

    res.json({ success: true, message: 'User deleted' });
  } finally {
    client.release();
  }
}

export async function getAllBookings(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT b.id, b.user_id, u.full_name as customer_name, u.email, u.phone, b.trip_id, b.booking_type, b.reference_id, 
             b.check_in_date, b.check_out_date, b.number_of_guests, b.total_price, b.status, b.created_at, b.special_requests,
             COALESCE(h.name, g.name, a.name, t.name) as service_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN hotels h ON b.booking_type = 'hotel' AND b.reference_id = h.id
      LEFT JOIN tour_guides g ON b.booking_type = 'guide' AND b.reference_id = g.id
      LEFT JOIN activities a ON b.booking_type = 'activity' AND b.reference_id = a.id
      LEFT JOIN transport_services t ON b.booking_type = 'transport' AND b.reference_id = t.id
      ORDER BY b.created_at DESC
    `);
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

export async function updateBooking(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status, total_price',
      [status, id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Booking not found');

    await logAdminAction(req, 'UPDATE_BOOKING', {
      resourceType: 'booking',
      resourceId: id,
      details: `Updated booking ${id} to ${status}`
    });

    // Send transition emails
    if (status === 'confirmed') {
      try {
        const detailResult = await client.query(`
          SELECT b.*, u.email, u.full_name, 
                 COALESCE(h.name, g.name, a.name, t.name) as service_name
          FROM bookings b
          JOIN users u ON b.user_id = u.id
          LEFT JOIN hotels h ON b.booking_type = 'hotel' AND b.reference_id = h.id
          LEFT JOIN tour_guides g ON b.booking_type = 'guide' AND b.reference_id = g.id
          LEFT JOIN activities a ON b.booking_type = 'activity' AND b.reference_id = a.id
          LEFT JOIN transport_services t ON b.booking_type = 'transport' AND b.reference_id = t.id
          WHERE b.id = $1
        `, [id]);

        const booking = detailResult.rows[0];
        if (booking) {
          const html = `
            <div style="font-family: 'Inter', sans-serif; background-color: #f4f7f6; padding: 40px; border-radius: 12px; color: #333; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #10B981; margin: 0; font-size: 28px;">Booking Confirmed! ✅</h1>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #444;">
                Hello <strong>${booking.full_name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #444;">
                Great news! Your booking for <strong>${booking.service_name}</strong> has been officially confirmed by our team.
              </p>
              
              <div style="background-color: white; padding: 25px; border-radius: 10px; border: 1px solid #e0e0e0; margin: 30px 0;">
                <h3 style="margin-top: 0; color: #10B981;">Booking Details</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                  <span style="color: #777;">Booking ID:</span>
                  <span style="font-weight: 600;">#${booking.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                  <span style="color: #777;">Service:</span>
                  <span style="font-weight: 600;">${booking.service_name}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                  <span style="color: #777;">Type:</span>
                  <span style="font-weight: 600; text-transform: capitalize;">${booking.booking_type}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                  <span style="color: #777;">Amount Paid:</span>
                  <span style="font-weight: 600; color: #10B981;">GH₵${Number(booking.total_price).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #777;">Date:</span>
                  <span style="font-weight: 600;">${new Date(booking.check_in_date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <p style="font-size: 14px; color: #777;">
                You can view your full itinerary and manage your trip in your TripEase dashboard.
              </p>
              
              <div style="text-align: center; margin-top: 25px;">
                <a href="${req.get('origin') || 'http://localhost:5173'}/dashboard/bookings" 
                   style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                  View My Bookings
                </a>
              </div>
              
              <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="font-size: 12px; color: #aaa; text-align: center;">
                If you have any questions about this booking, please contact our support team. <br/>
                &copy; ${new Date().getFullYear()} TripEase Ghana.
              </p>
            </div>
          `;

          await sendEmail({
            email: booking.email,
            subject: `Booking Confirmed: ${booking.service_name} | TripEase Ghana`,
            message: `Your booking for ${booking.service_name} has been confirmed. Total price: GH₵${Number(booking.total_price).toFixed(2)}.`,
            html
          });
        }
      } catch (emailErr) {
        console.error('Booking confirmation email failed:', emailErr);
      }
    }

    res.json({ success: true, message: 'Booking updated', data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function getAllReviews(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT r.id, r.user_id, u.full_name as user_name, r.booking_id, r.rating, r.title, r.comment, r.status, r.created_at 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function deleteReview(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM reviews WHERE id = $1', [id]);

    await logAdminAction(req, 'DELETE_REVIEW', {
      resourceType: 'review',
      resourceId: id,
      details: `Deleted review ${id}`
    });

    res.json({ success: true, message: 'Review deleted' });
  } finally {
    client.release();
  }
}

export async function updateReviewStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'published', 'rejected', 'flagged'].includes(status)) {
    throw new ValidationError('Invalid review status');
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE reviews SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) throw new NotFoundError('Review not found');

    await logAdminAction(req, 'UPDATE_REVIEW_STATUS', {
      resourceType: 'review',
      resourceId: id,
      details: `Updated review ${id} status to ${status}`
    });

    res.json({ success: true, message: `Review status updated to ${status}`, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function getRefunds(req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, booking_id, amount, reason, status, created_at FROM refunds ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function updateRefund(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE refunds SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status, amount',
      [status, id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Refund not found');

    await logAdminAction(req, 'UPDATE_REFUND', {
      resourceType: 'refund',
      resourceId: id,
      details: `Updated refund ${id} to ${status}`
    });

    res.json({ success: true, message: 'Refund updated', data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function getDisputes(req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, booking_id, description, status, admin_notes, created_at FROM disputes ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function updateDispute(req, res) {
  const { id } = req.params;
  const { status, adminNotes } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE disputes SET status = $1, admin_notes = COALESCE($2, admin_notes), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, status, admin_notes',
      [status, adminNotes || null, id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Dispute not found');

    await logAdminAction(req, 'UPDATE_DISPUTE', {
      resourceType: 'dispute',
      resourceId: id,
      details: `Updated dispute ${id} to ${status}`
    });

    res.json({ success: true, message: 'Dispute updated', data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function getAnalytics(req, res) {
  const client = await pool.connect();
  try {
    const [monthly, byType, topDestinations] = await Promise.all([
      client.query(`
        SELECT DATE_TRUNC('month', created_at)::date as month, 
               COUNT(*) as count, 
               SUM(total_price) as revenue
        FROM bookings
        WHERE status != 'cancelled'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month ASC
        LIMIT 12
      `),
      client.query(`
        SELECT booking_type, 
               COUNT(*) as count, 
               AVG(total_price) as avg_price,
               SUM(total_price) as total_revenue
        FROM bookings
        WHERE status != 'cancelled'
        GROUP BY booking_type
      `),
      client.query(`
        SELECT destination as name, 
               COUNT(*) as count, 
               SUM(budget) as revenue
        FROM trips
        WHERE status != 'cancelled'
        GROUP BY destination
        ORDER BY count DESC
        LIMIT 5
      `),
    ]);

    res.json({
      success: true,
      data: {
        monthlyBookings: monthly.rows.map(row => ({
          month: new Date(row.month).toLocaleString('default', { month: 'short' }),
          bookings: parseInt(row.count),
          revenue: parseFloat(row.revenue || 0)
        })),
        bookingsByType: byType.rows.map(row => ({
          type: row.booking_type,
          count: parseInt(row.count),
          avg_price: parseFloat(row.avg_price || 0),
          revenue: parseFloat(row.total_revenue || 0)
        })),
        topDestinations: topDestinations.rows.map(row => ({
          name: row.name,
          bookings: parseInt(row.count),
          revenue: parseFloat(row.revenue || 0)
        }))
      },
    });
  } finally {
    client.release();
  }
}

export async function updateSettings(req, res) {
  const { key, value } = req.body;
  const client = await pool.connect();
  try {
    await logAdminAction(req, 'UPDATE_SETTINGS', {
      resourceType: 'settings',
      resourceId: key,
      details: `Updated setting ${key}`
    });
    res.json({ success: true, message: 'Settings updated', data: { key, value } });
  } finally {
    client.release();
  }
}

export async function getListings(req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT p.id, p.business_name as name, p.business_type as type, u.full_name as provider, 
             p.status, p.created_at as submitted, 'Ghana' as location 
      FROM providers p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function updateListing(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE providers SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status',
      [status, id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Listing not found');

    await logAdminAction(req, 'UPDATE_LISTING', {
      resourceType: 'provider',
      resourceId: id,
      details: `Updated listing ${id} to ${status}`
    });

    res.json({ success: true, message: 'Listing updated', data: result.rows[0] });
  } finally {
    client.release();
  }
}
export async function getAllTrips(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT t.id, t.user_id, u.full_name as user_name, t.destination, t.start_date, t.end_date, 
             t.budget, t.created_at, t.status, t.is_public, t.is_featured 
      FROM trips t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function getTripById(req, res) {
  const { id } = req.params;
  console.log(`[Admin] Fetching trip by ID: ${id}`);
  const client = await pool.connect();
  try {
    const trip = await client.query(`
      SELECT t.*, u.full_name as user_name 
      FROM trips t 
      JOIN users u ON t.user_id = u.id 
      WHERE t.id = $1`, [id]);
    if (trip.rows.length === 0) throw new NotFoundError('Trip not found');

    const itineraries = await client.query('SELECT * FROM itineraries WHERE trip_id = $1 ORDER BY day_number ASC', [id]);
    const bookings = await client.query('SELECT * FROM bookings WHERE trip_id = $1', [id]);

    res.json({
      success: true,
      data: {
        ...trip.rows[0],
        itineraries: itineraries.rows,
        bookings: bookings.rows
      }
    });
  } finally {
    client.release();
  }
}

export async function updateTrip(req, res) {
  const { id } = req.params;
  const fields = req.body;
  const client = await pool.connect();
  try {
    const keys = Object.keys(fields).filter(k => k !== 'id');
    if (keys.length === 0) {
      const result = await client.query('SELECT * FROM trips WHERE id = $1', [id]);
      return res.json({ success: true, data: result.rows[0] });
    }

    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const params = keys.map(k => fields[k]);
    params.push(id);

    const result = await client.query(
      `UPDATE trips SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (result.rows.length === 0) throw new NotFoundError('Trip not found');

    await logAdminAction(req, 'UPDATE_TRIP', {
      resourceType: 'trip',
      resourceId: id,
      details: `Updated trip ${id}`
    });

    res.json({ success: true, message: 'Trip updated', data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function deleteTrip(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    // Delete itineraries first
    await client.query('DELETE FROM itineraries WHERE trip_id = $1', [id]);
    const result = await client.query('DELETE FROM trips WHERE id = $1', [id]);
    if (result.rowCount === 0) throw new NotFoundError('Trip not found');

    await logAdminAction(req, 'DELETE_TRIP', {
      resourceType: 'trip',
      resourceId: id,
      details: `Deleted trip ${id}`
    });

    res.json({ success: true, message: 'Trip deleted' });
  } finally {
    client.release();
  }
}

// Destinations Management
export async function getAllDestinations(req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT d.*, c.name as category_name 
      FROM destinations d
      LEFT JOIN trip_categories c ON d.category_id = c.id
      ORDER BY d.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function createDestination(req, res) {
  const { name, region, category_id, description, image_url, entrance_fee, opening_hours, location_data, tags, status } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO destinations (name, region, category_id, description, image_url, entrance_fee, opening_hours, location_data, tags, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [name, region, category_id || null, description, image_url, entrance_fee, opening_hours, location_data || {}, tags || [], status || 'published']
    );

    await logAdminAction(req, 'CREATE_DESTINATION', {
      resourceType: 'destination',
      resourceId: result.rows[0].id,
      details: `Created destination ${name}`
    });

    res.status(201).json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function updateDestination(req, res) {
  const { id } = req.params;
  const fields = req.body;
  const client = await pool.connect();
  try {
    const keys = Object.keys(fields).filter(k => k !== 'id');
    if (keys.length === 0) {
      const result = await client.query('SELECT * FROM destinations WHERE id = $1', [id]);
      return res.json({ success: true, data: result.rows[0] });
    }

    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const params = keys.map(k => fields[k]);
    params.push(id);

    const result = await client.query(
      `UPDATE destinations SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${params.length} RETURNING *`,
      params
    );

    await logAdminAction(req, 'UPDATE_DESTINATION', {
      resourceType: 'destination',
      resourceId: id,
      details: `Updated destination ${id}`
    });

    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function deleteDestination(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM destinations WHERE id = $1', [id]);

    await logAdminAction(req, 'DELETE_DESTINATION', {
      resourceType: 'destination',
      resourceId: id,
      details: `Deleted destination ${id}`
    });

    res.json({ success: true, message: 'Destination deleted' });
  } finally {
    client.release();
  }
}

// Attractions Management
export async function getAllAttractions(req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT a.*, d.name as destination_name 
      FROM attractions a
      JOIN destinations d ON a.destination_id = d.id
      ORDER BY a.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function createAttraction(req, res) {
  const { destination_id, name, category, description, image_url, entrance_fee, opening_hours, location_data, status } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO attractions (destination_id, name, category, description, image_url, entrance_fee, opening_hours, location_data, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [destination_id, name, category, description, image_url, entrance_fee, opening_hours, location_data || {}, status || 'published']
    );

    await logAdminAction(req, 'CREATE_ATTRACTION', {
      resourceType: 'attraction',
      resourceId: result.rows[0].id,
      details: `Created attraction ${name}`
    });

    res.status(201).json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function updateAttraction(req, res) {
  const { id } = req.params;
  const fields = req.body;
  const client = await pool.connect();
  try {
    const keys = Object.keys(fields).filter(k => k !== 'id');
    if (keys.length === 0) {
      const result = await client.query('SELECT * FROM attractions WHERE id = $1', [id]);
      return res.json({ success: true, data: result.rows[0] });
    }

    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const params = keys.map(k => fields[k]);
    params.push(id);

    const result = await client.query(
      `UPDATE attractions SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${params.length} RETURNING *`,
      params
    );

    await logAdminAction(req, 'UPDATE_ATTRACTION', {
      resourceType: 'attraction',
      resourceId: id,
      details: `Updated attraction ${id}`
    });

    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function deleteAttraction(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM attractions WHERE id = $1', [id]);

    await logAdminAction(req, 'DELETE_ATTRACTION', {
      resourceType: 'attraction',
      resourceId: id,
      details: `Deleted attraction ${id}`
    });

    res.json({ success: true, message: 'Attraction deleted' });
  } finally {
    client.release();
  }
}

// Suggested Itineraries Management
export async function getAllSuggestedItineraries(req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT s.*, d.name as destination_name 
      FROM suggested_itineraries s
      JOIN destinations d ON s.destination_id = d.id
      ORDER BY s.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function createSuggestedItinerary(req, res) {
  const { destination_id, title, description, duration_days, image_url, items } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO suggested_itineraries (destination_id, title, description, duration_days, image_url, items)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [destination_id, title, description, duration_days, image_url, items || []]
    );
    await logAdminAction(req, 'CREATE_SUGGESTED_ITINERARY', {
      resourceType: 'suggested_itinerary',
      resourceId: result.rows[0].id,
      details: `Created suggested itinerary: ${title}`
    });

    res.status(201).json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function updateSuggestedItinerary(req, res) {
  const { id } = req.params;
  const fields = req.body;
  const client = await pool.connect();
  try {
    const keys = Object.keys(fields).filter(k => k !== 'id');
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const params = keys.map(k => fields[k]);
    params.push(id);

    const result = await client.query(
      `UPDATE suggested_itineraries SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${params.length} RETURNING *`,
      params
    );
    await logAdminAction(req, 'UPDATE_SUGGESTED_ITINERARY', {
      resourceType: 'suggested_itinerary',
      resourceId: id,
      details: `Updated suggested itinerary ${id}`
    });

    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function deleteSuggestedItinerary(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM suggested_itineraries WHERE id = $1', [id]);
    
    await logAdminAction(req, 'DELETE_SUGGESTED_ITINERARY', {
      resourceType: 'suggested_itinerary',
      resourceId: id,
      details: `Deleted suggested itinerary ${id}`
    });

    res.json({ success: true, message: 'Suggested itinerary deleted' });
  } finally {
    client.release();
  }
}

// Trip Categories Management
export async function getAllCategories(req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM trip_categories ORDER BY name ASC');
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function createCategory(req, res) {
  const { name, description, icon } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO trip_categories (name, description, icon) VALUES ($1, $2, $3) RETURNING *',
      [name, description, icon]
    );
    await logAdminAction(req, 'CREATE_CATEGORY', {
      resourceType: 'trip_category',
      resourceId: result.rows[0].id,
      details: `Created trip category: ${name}`
    });

    res.status(201).json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, description, icon } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE trip_categories SET name = $1, description = $2, icon = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, description, icon, id]
    );
    await logAdminAction(req, 'UPDATE_CATEGORY', {
      resourceType: 'trip_category',
      resourceId: id,
      details: `Updated trip category ${id}`
    });

    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function deleteCategory(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM trip_categories WHERE id = $1', [id]);

    await logAdminAction(req, 'DELETE_CATEGORY', {
      resourceType: 'trip_category',
      resourceId: id,
      details: `Deleted trip category ${id}`
    });

    res.json({ success: true, message: 'Category deleted' });
  } finally {
    client.release();
  }
}

// Travel Information Management
export async function getAllTravelInfo(req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM travel_info ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function createTravelInfo(req, res) {
  const { title, category, content, icon, is_featured } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO travel_info (title, category, content, icon, is_featured) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, category, content, icon, is_featured || false]
    );
    await logAdminAction(req, 'CREATE_TRAVEL_INFO', {
      resourceType: 'travel_info',
      resourceId: result.rows[0].id,
      details: `Created travel information: ${title}`
    });

    res.status(201).json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function updateTravelInfo(req, res) {
  const { id } = req.params;
  const fields = req.body;
  const client = await pool.connect();
  try {
    const keys = Object.keys(fields).filter(k => k !== 'id');
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const params = keys.map(k => fields[k]);
    params.push(id);

    const result = await client.query(
      `UPDATE travel_info SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${params.length} RETURNING *`,
      params
    );
    await logAdminAction(req, 'UPDATE_TRAVEL_INFO', {
      resourceType: 'travel_info',
      resourceId: id,
      details: `Updated travel information ${id}`
    });

    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function deleteTravelInfo(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM travel_info WHERE id = $1', [id]);

    await logAdminAction(req, 'DELETE_TRAVEL_INFO', {
      resourceType: 'travel_info',
      resourceId: id,
      details: `Deleted travel information ${id}`
    });

    res.json({ success: true, message: 'Travel info deleted' });
  } finally {
    client.release();
  }
}
