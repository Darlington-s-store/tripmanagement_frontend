import pool from '../config/database.js';
import { UnauthorizedError, NotFoundError, ValidationError } from '../utils/errors.js';
import { notifyAdmins } from './notificationController.js';

export async function createReview(req, res) {
  const { bookingId, rating, title, comment, full_name, location } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!rating) {
    throw new ValidationError('Rating is required');
  }

  const client = await pool.connect();
  try {
    // If booking-specific review, do checks
    if (bookingId && userId) {
      const bookingCheck = await client.query(
        'SELECT id, status FROM bookings WHERE id = $1 AND user_id = $2',
        [bookingId, userId]
      );

      if (bookingCheck.rows.length === 0) {
        throw new ValidationError('Booking not found or not authorized');
      }

      if (bookingCheck.rows[0].status !== 'completed') {
        throw new ValidationError('You can only review completed services');
      }

      const reviewCheck = await client.query(
        'SELECT id FROM reviews WHERE booking_id = $1',
        [bookingId]
      );

      if (reviewCheck.rows.length > 0) {
        throw new ValidationError('You have already reviewed this service');
      }
    }

    // Create the review with default status 'pending' (for moderation)
    const result = await client.query(
      `INSERT INTO reviews (user_id, booking_id, rating, title, comment, status, full_name, location) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, user_id, booking_id, rating, title, comment, status, full_name, location, created_at`,
      [userId, bookingId || null, rating, title || null, comment || null, 'pending', full_name || null, location || null]
    );

    // Notify Admins about the new review for moderation
    await notifyAdmins(
      'new_review',
      'New Review Submitted',
      `${full_name || 'Anonymous'} submitted a ${rating}-star review for moderation.`
    );

    res.status(201).json({ 
      success: true, 
      message: 'Review submitted for moderation', 
      data: result.rows[0] 
    });
  } finally {
    client.release();
  }
}

export async function getPublishedReviews(req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT r.id, COALESCE(r.full_name, u.full_name, 'Anonymous') as full_name, 
              COALESCE(r.location, 'Traveler') as location, 
              r.comment, r.rating, r.created_at 
       FROM reviews r 
       LEFT JOIN users u ON r.user_id = u.id 
       WHERE r.status = 'published' 
       ORDER BY r.created_at DESC 
       LIMIT 10`
    );
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function getUserReviews(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, booking_id, rating, title, comment, status, created_at FROM reviews WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function getBookingReviews(req, res) {
  const { bookingId } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT r.id, r.user_id, r.booking_id, r.rating, r.title, r.comment, r.created_at, 
              COALESCE(r.full_name, u.full_name, 'Anonymous') as reviewer_name
       FROM reviews r 
       LEFT JOIN users u ON r.user_id = u.id 
       WHERE r.booking_id = $1 
       ORDER BY r.created_at DESC`,
      [bookingId]
    );
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function updateReview(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { id } = req.params;
  const { rating, title, comment } = req.body;

  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE reviews SET rating = COALESCE($1, rating), title = COALESCE($2, title), 
       comment = COALESCE($3, comment), updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 AND user_id = $5 
       RETURNING id, rating, title, comment, updated_at`,
      [rating || null, title || null, comment || null, id, req.user.id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Review not found or not authorized');
    res.json({ success: true, message: 'Review updated', data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function deleteReview(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM reviews WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ success: true, message: 'Review deleted' });
  } finally {
    client.release();
  }
}
