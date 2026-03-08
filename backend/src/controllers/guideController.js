import pool from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { v4 as uuidv4 } from 'uuid';

export async function getAllGuides(req, res) {
  const { language, minPrice, maxPrice, limit = 20, offset = 0 } = req.query;
  const client = await pool.connect();
  try {
    let query = 'SELECT id, name, experience_years, languages, hourly_rate, bio, rating, availability, image_url FROM tour_guides WHERE 1=1';
    const params = [];

    if (language) {
      query += ` AND languages ILIKE $${params.length + 1}`;
      params.push(`%${language}%`);
    }
    if (minPrice) {
      query += ` AND hourly_rate >= $${params.length + 1}`;
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      query += ` AND hourly_rate <= $${params.length + 1}`;
      params.push(parseFloat(maxPrice));
    }

    query += ` ORDER BY rating DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await client.query(query, params);
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function getGuideById(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM tour_guides WHERE id = $1', [id]);
    if (result.rows.length === 0) throw new NotFoundError('Guide not found');
    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function createGuide(req, res) {
  const { name, experienceYears, languages, hourlyRate, bio, availability, imageUrl } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO tour_guides (id, name, experience_years, languages, hourly_rate, bio, availability, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, name, experience_years, languages, hourly_rate, rating`,
      [uuidv4(), name, experienceYears || 0, languages, hourlyRate, bio, availability, imageUrl]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function updateGuide(req, res) {
  const { id } = req.params;
  const { name, experienceYears, languages, hourlyRate, bio, availability, imageUrl } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE tour_guides SET name = COALESCE($1, name), experience_years = COALESCE($2, experience_years), 
       languages = COALESCE($3, languages), hourly_rate = COALESCE($4, hourly_rate),
       bio = COALESCE($5, bio), availability = COALESCE($6, availability),
       image_url = COALESCE($7, image_url), updated_at = CURRENT_TIMESTAMP WHERE id = $8 
       RETURNING id, name, experience_years, languages, hourly_rate, rating`,
      [name || null, experienceYears || null, languages || null, hourlyRate || null, bio || null, availability || null, imageUrl || null, id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Guide not found');
    res.json({ success: true, message: 'Guide updated', data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function deleteGuide(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM tour_guides WHERE id = $1', [id]);
    res.json({ success: true, message: 'Guide deleted' });
  } finally {
    client.release();
  }
}
