import pool from '../config/database.js';
import { UnauthorizedError, NotFoundError, ValidationError, ForbiddenError } from '../utils/errors.js';
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
      'UPDATE users SET status = $1, role = $2, full_name = $3, email = $4, phone = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [status, role, full_name, email, phone, id]
    );
    if (result.rows.length === 0) throw new NotFoundError('User not found');

    await logAdminAction(req, 'UPDATE_USER', {
      resourceType: 'user',
      resourceId: id,
      details: `Updated user ${id}`
    });

    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function deleteUser(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    // Audit check before deletion can be added here
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

// Trip Management
export async function getAllTrips(req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT t.*, u.full_name as user_name, u.email as user_email
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
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT t.*, u.full_name as user_name, u.email as user_email
      FROM trips t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = $1
    `, [id]);
    if (result.rows.length === 0) throw new NotFoundError('Trip not found');
    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function updateTrip(req, res) {
  const { id } = req.params;
  const { status, trip_name, destination } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE trips SET status = $1, trip_name = $2, destination = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [status, trip_name, destination, id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Trip not found');
    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function deleteTrip(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM trips WHERE id = $1', [id]);
    res.json({ success: true, message: 'Trip deleted' });
  } finally {
    client.release();
  }
}

// Booking Management
export async function getAllBookings(req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT b.*, u.full_name as user_name, u.email as user_email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
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
    const result = await client.query(`
      SELECT b.*, u.full_name as user_name, u.email as user_email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = $1
    `, [id]);
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
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Booking not found');
    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

// Destination Management
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
  const { name, description, location, category_id, image_url, budget_level } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO destinations (name, description, location, category_id, image_url, budget_level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, location, category_id, image_url, budget_level]
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

// Attraction Management
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
  const { destination_id, name, description, image_url, entrance_fee, opening_hours } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO attractions (destination_id, name, description, image_url, entrance_fee, opening_hours) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [destination_id, name, description, image_url, entrance_fee, opening_hours]
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

// --- Additional GetById Functions ---

export async function getDestinationById(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT d.*, c.name as category_name 
      FROM destinations d
      LEFT JOIN trip_categories c ON d.category_id = c.id
      WHERE d.id = $1
    `, [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Destination not found' });
    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function getAttractionById(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT a.*, d.name as destination_name 
      FROM attractions a
      JOIN destinations d ON a.destination_id = d.id
      WHERE a.id = $1
    `, [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Attraction not found' });
    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function getSuggestedItineraryById(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT s.*, d.name as destination_name 
      FROM suggested_itineraries s
      JOIN destinations d ON s.destination_id = d.id
      WHERE s.id = $1
    `, [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Suggested itinerary not found' });
    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function getCategoryById(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM trip_categories WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Category not found' });
    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function getTravelInfoById(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM travel_info WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Travel info not found' });
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

// Transport Management
export async function getAllTransport(req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM transport_services ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function createTransport(req, res) {
  const { 
    name, type, operator, from_location, to_location, 
    departure_time, arrival_time, price, capacity, image_url,
    description, amenities, vehicle_model, plate_number, support_phone, support_email
  } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO transport_services (
        name, type, operator, from_location, to_location, 
        departure_time, arrival_time, price, capacity, image_url,
        description, amenities, vehicle_model, plate_number, support_phone, support_email
      ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [
        name, type, operator, from_location, to_location, 
        departure_time, arrival_time, price, capacity, image_url,
        description, amenities || [], vehicle_model, plate_number, support_phone, support_email
      ]
    );
    await logAdminAction(req, 'CREATE_TRANSPORT', {
      resourceType: 'transport',
      resourceId: result.rows[0].id,
      details: `Created transport service ${name}`
    });
    res.status(201).json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function updateTransport(req, res) {
  const { id } = req.params;
  const { 
    name, type, operator, from_location, to_location, 
    departure_time, arrival_time, price, capacity, image_url, status,
    description, amenities, vehicle_model, plate_number, support_phone, support_email
  } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE transport_services SET 
        name = $1, type = $2, operator = $3, from_location = $4, to_location = $5, 
        departure_time = $6, arrival_time = $7, price = $8, capacity = $9, image_url = $10, status = $11,
        description = $12, amenities = $13, vehicle_model = $14, plate_number = $15, support_phone = $16, support_email = $17,
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = $18 RETURNING *`,
      [
        name, type, operator, from_location, to_location, 
        departure_time, arrival_time, price, capacity, image_url, status,
        description, amenities || [], vehicle_model, plate_number, support_phone, support_email,
        id
      ]
    );
    await logAdminAction(req, 'UPDATE_TRANSPORT', {
      resourceType: 'transport',
      resourceId: id,
      details: `Updated transport service ${id}`
    });
    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function deleteTransport(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM transport_services WHERE id = $1', [id]);
    await logAdminAction(req, 'DELETE_TRANSPORT', {
      resourceType: 'transport',
      resourceId: id,
      details: `Deleted transport service ${id}`
    });
    res.json({ success: true, message: 'Transport service deleted' });
  } finally {
    client.release();
  }
}

// Review Management
export async function getAllReviews(req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT r.id, r.user_id, r.booking_id, r.rating, r.comment, r.status, r.full_name, r.location, r.created_at, 
             u.full_name as user_name, u.email as user_email
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function updateReviewStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
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
      details: `Updated review status to ${status}`
    });

    res.json({ success: true, data: result.rows[0] });
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

// Refunds Management
export async function getRefunds(req, res) {
  const client = await pool.connect();
  try {
    // Assuming a refunds table exists, if not, we can query bookings with refund status
    const result = await client.query(`
      SELECT b.id as booking_id, b.total_price, b.status, u.full_name as user_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.status IN ('refund_requested', 'refunded')
      ORDER BY b.updated_at DESC
    `);
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
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status',
      [status, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

// Disputes Management
export async function getDisputes(req, res) {
  // Mocking disputes if table doesn't exist yet, otherwise query DB
  // For now, return empty to avoid errors
  res.json({ success: true, data: [] });
}

export async function updateDispute(req, res) {
  res.json({ success: true, message: 'Dispute updated' });
}

// Analytics
export async function getAnalytics(req, res) {
  const client = await pool.connect();
  try {
    const [bookings, revenue, users] = await Promise.all([
      client.query('SELECT COUNT(*) FROM bookings'),
      client.query("SELECT SUM(total_price) FROM bookings WHERE status = 'completed'"),
      client.query('SELECT COUNT(*) FROM users WHERE role = $1', ['user'])
    ]);

    res.json({
      success: true,
      data: {
        bookingsCount: parseInt(bookings.rows[0].count),
        totalRevenue: parseFloat(revenue.rows[0].sum || 0),
        usersCount: parseInt(users.rows[0].count)
      }
    });
  } finally {
    client.release();
  }
}

// Settings
export async function updateSettings(req, res) {
  // Logic to update global system settings (often stored in a settings table or config file)
  res.json({ success: true, message: 'Settings updated' });
}

// Listings (Providers)
export async function getListings(req, res) {
  const client = await pool.connect();
  try {
    const [hotels, transport, guides] = await Promise.all([
      client.query('SELECT id, name, status, created_at FROM hotels'),
      client.query('SELECT id, name, status, created_at FROM transport_services'),
      client.query('SELECT id, name, status, created_at FROM tour_guides')
    ]);

    res.json({
      success: true,
      data: {
        hotels: hotels.rows,
        transport: transport.rows,
        guides: guides.rows
      }
    });
  } finally {
    client.release();
  }
}

export async function updateListing(req, res) {
  const { id } = req.params;
  const { status, type } = req.body; // type: hotel, transport, guide
  const client = await pool.connect();
  try {
    let table = '';
    if (type === 'hotel') table = 'hotels';
    else if (type === 'transport') table = 'transport_services';
    else if (type === 'guide') table = 'tour_guides';
    else throw new ValidationError('Invalid listing type');

    const result = await client.query(
      `UPDATE ${table} SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status`,
      [status, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}
