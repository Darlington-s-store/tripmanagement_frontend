import pool from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export async function getAllHotels(req, res) {
  const { location, region, minPrice, maxPrice, rating, amenities, sortBy, limit = 20, offset = 0 } = req.query;
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM hotels WHERE 1=1';
    const params = [];

    if (location || region) {
      if (location && region) {
        query += ` AND (location ILIKE $${params.length + 1} OR region ILIKE $${params.length + 2})`;
        params.push(`%${location}%`, `%${region}%`);
      } else if (location) {
        query += ` AND (location ILIKE $${params.length + 1} OR region ILIKE $${params.length + 1})`;
        params.push(`%${location}%`);
      } else {
        query += ` AND region ILIKE $${params.length + 1}`;
        params.push(`%${region}%`);
      }
    }

    if (minPrice) {
      query += ` AND price_per_night >= $${params.length + 1}`;
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      query += ` AND price_per_night <= $${params.length + 1}`;
      params.push(parseFloat(maxPrice));
    }
    if (rating && rating !== 'all') {
      query += ` AND rating >= $${params.length + 1}`;
      params.push(parseFloat(rating));
    }
    if (amenities) {
      const amenityList = Array.isArray(amenities) ? amenities : [amenities];
      amenityList.forEach(amenity => {
        query += ` AND amenities ILIKE $${params.length + 1}`;
        params.push(`%${amenity}%`);
      });
    }

    // Sorting
    if (sortBy === 'price-asc') query += ' ORDER BY price_per_night ASC';
    else if (sortBy === 'price-desc') query += ' ORDER BY price_per_night DESC';
    else if (sortBy === 'rating') query += ' ORDER BY rating DESC';
    else query += ' ORDER BY created_at DESC';

    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await client.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } finally {
    client.release();
  }
}

export async function getHotelById(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const hotelResult = await client.query('SELECT * FROM hotels WHERE id = $1', [id]);
    if (hotelResult.rows.length === 0) throw new NotFoundError('Hotel not found');

    const hotel = hotelResult.rows[0];

    // Fetch rooms for this hotel
    const roomsResult = await client.query('SELECT * FROM hotel_rooms WHERE hotel_id = $1', [id]);
    hotel.rooms = roomsResult.rows;

    // Fetch average rating and review count
    const reviewResult = await client.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as review_count 
       FROM reviews 
       JOIN bookings ON reviews.booking_id = bookings.id 
       WHERE bookings.reference_id = $1 AND bookings.booking_type = 'hotel'`,
      [id]
    );
    hotel.avgReviewRating = reviewResult.rows[0].avg_rating || hotel.rating;
    hotel.reviewCount = reviewResult.rows[0].review_count || 0;

    res.json({ success: true, data: hotel });
  } finally {
    client.release();
  }
}

export async function getRoomsForHotel(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM hotel_rooms WHERE hotel_id = $1', [id]);
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function createHotel(req, res) {
  const { name, location, region, pricePerNight, rating, imageUrl, images, description, amenities, totalRooms } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO hotels (name, location, region, price_per_night, rating, image_url, images, description, amenities, total_rooms, available_rooms) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10) 
       RETURNING *`,
      [name, location, region, pricePerNight, rating || 0, imageUrl, JSON.stringify(images || []), description, amenities, totalRooms || 0]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function updateHotel(req, res) {
  const { id } = req.params;
  const { name, location, region, price_per_night, rating, image_url, images, description, amenities, total_rooms, available_rooms } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE hotels SET 
       name = COALESCE($1, name), location = COALESCE($2, location), region = COALESCE($3, region),
       price_per_night = COALESCE($4, price_per_night), rating = COALESCE($5, rating),
       image_url = COALESCE($6, image_url), images = COALESCE($7, images),
       description = COALESCE($8, description), amenities = COALESCE($9, amenities),
       total_rooms = COALESCE($10, total_rooms), available_rooms = COALESCE($11, available_rooms),
       updated_at = CURRENT_TIMESTAMP WHERE id = $12 
       RETURNING *`,
      [name || null, location || null, region || null, price_per_night || null, rating || null, image_url || null, images ? JSON.stringify(images) : null, description || null, amenities || null, total_rooms || null, available_rooms || null, id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Hotel not found');
    res.json({ success: true, message: 'Hotel updated', data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function deleteHotel(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM hotels WHERE id = $1', [id]);
    res.json({ success: true, message: 'Hotel deleted' });
  } finally {
    client.release();
  }
}

// Room Management
export async function createHotelRoom(req, res) {
  const { hotel_id, room_type, price_per_night, capacity, available_count, amenities, description, images } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO hotel_rooms (hotel_id, room_type, price_per_night, capacity, available_count, amenities, description, images) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [hotel_id, room_type, price_per_night, capacity, available_count, amenities, description, JSON.stringify(images || [])]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function updateHotelRoom(req, res) {
  const { id } = req.params;
  const { room_type, price_per_night, capacity, available_count, amenities, description, images } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE hotel_rooms SET 
       room_type = COALESCE($1, room_type),
       price_per_night = COALESCE($2, price_per_night),
       capacity = COALESCE($3, capacity),
       available_count = COALESCE($4, available_count),
       amenities = COALESCE($5, amenities),
       description = COALESCE($6, description),
       images = COALESCE($7, images)
       WHERE id = $8 
       RETURNING *`,
      [room_type || null, price_per_night || null, capacity || null, available_count || null, amenities || null, description || null, images ? JSON.stringify(images) : null, id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Room not found');
    res.json({ success: true, message: 'Room updated', data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function deleteHotelRoom(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM hotel_rooms WHERE id = $1', [id]);
    res.json({ success: true, message: 'Room deleted' });
  } finally {
    client.release();
  }
}

