import pool from '../config/database.js';
import { UnauthorizedError, NotFoundError, ValidationError } from '../utils/errors.js';
import { v4 as uuidv4 } from 'uuid';

export async function createReview(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { bookingId, rating, title, comment } = req.body;
  if (!bookingId || !rating) {
    throw new ValidationError('Booking ID and rating are required');
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO reviews (id, user_id, booking_id, rating, title, comment) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, user_id, booking_id, rating, title, comment, created_at`,
      [uuidv4(), req.user.id, bookingId, rating, title || null, comment || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function getUserReviews(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, booking_id, rating, title, comment, created_at FROM reviews WHERE user_id = $1 ORDER BY created_at DESC',
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
      `SELECT r.id, r.user_id, r.booking_id, r.rating, r.title, r.comment, r.created_at, u.full_name as reviewer_name
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
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
    await client.query('DELETE FROM reviews WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ success: true, message: 'Review deleted' });
  } finally {
    client.release();
  }
}
