import pool from '../config/database.js';
import { UnauthorizedError, NotFoundError, ValidationError } from '../utils/errors.js';
import { v4 as uuidv4 } from 'uuid';

export async function createTrip(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { destination, startDate, endDate, budget, description } = req.body;
  if (!destination || !startDate || !endDate) {
    throw new ValidationError('Destination, start date, and end date are required');
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO trips (id, user_id, destination, start_date, end_date, budget, description, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, user_id, destination, start_date, end_date, budget, status, created_at`,
      [uuidv4(), req.user.id, destination, startDate, endDate, budget || 0, description || '', 'planning']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function getUserTrips(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, destination, start_date, end_date, budget, status, created_at FROM trips WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function getTripById(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    // 1. Get trip basics
    const tripResult = await client.query('SELECT * FROM trips WHERE id = $1', [id]);
    if (tripResult.rows.length === 0) throw new NotFoundError('Trip not found');
    const trip = tripResult.rows[0];

    // 2. Get itineraries
    const itineraryResult = await client.query(
      'SELECT * FROM itineraries WHERE trip_id = $1 ORDER BY day_number ASC',
      [id]
    );
    trip.itineraries = itineraryResult.rows;

    // 3. Get linked bookings
    const bookingsResult = await client.query(
      `SELECT b.*, 
        CASE 
          WHEN b.booking_type = 'hotel' THEN h.name
          WHEN b.booking_type = 'guide' THEN g.name
          WHEN b.booking_type = 'activity' THEN a.name
        END as service_name
       FROM bookings b
       LEFT JOIN hotels h ON b.booking_type = 'hotel' AND b.reference_id = h.id
       LEFT JOIN tour_guides g ON b.booking_type = 'guide' AND b.reference_id = g.id
       LEFT JOIN activities a ON b.booking_type = 'activity' AND b.reference_id = a.id
       WHERE b.trip_id = $1`,
      [id]
    );
    trip.bookings = bookingsResult.rows;

    res.json({ success: true, data: trip });
  } finally {
    client.release();
  }
}

export async function updateTrip(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { id } = req.params;
  const { destination, startDate, endDate, budget, description, status } = req.body;

  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE trips SET destination = COALESCE($1, destination), start_date = COALESCE($2, start_date), 
       end_date = COALESCE($3, end_date), budget = COALESCE($4, budget), description = COALESCE($5, description),
       status = COALESCE($6, status), updated_at = CURRENT_TIMESTAMP WHERE id = $7 AND user_id = $8 
       RETURNING id, destination, start_date, end_date, budget, status`,
      [destination || null, startDate || null, endDate || null, budget || null, description || null, status || null, id, req.user.id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Trip not found or not authorized');
    res.json({ success: true, message: 'Trip updated', data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function deleteTrip(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM trips WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ success: true, message: 'Trip deleted' });
  } finally {
    client.release();
  }
}

export async function addItinerary(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { id } = req.params;
  const { dayNumber, activities, notes } = req.body;

  if (!dayNumber) {
    throw new ValidationError('Day number is required');
  }

  const client = await pool.connect();
  try {
    // Verify trip belongs to user
    const trip = await client.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (trip.rows.length === 0) throw new NotFoundError('Trip not found or not authorized');

    const result = await client.query(
      `INSERT INTO itineraries (id, trip_id, day_number, activities, notes) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, trip_id, day_number, activities, notes, created_at`,
      [uuidv4(), id, dayNumber, activities || '', notes || '']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function getItinerary(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, trip_id, day_number, activities, notes, created_at FROM itineraries WHERE trip_id = $1 ORDER BY day_number ASC',
      [id]
    );
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}
