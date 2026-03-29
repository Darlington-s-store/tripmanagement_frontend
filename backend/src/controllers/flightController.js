import pool from '../config/database.js';

export const getAllFlights = async (req, res) => {
  try {
    const { from, to, status } = req.query;
    let query = 'SELECT * FROM flights WHERE 1=1';
    const params = [];

    if (from) {
      params.push(`%${from}%`);
      query += ` AND departure_airport ILIKE $${params.length}`;
    }

    if (to) {
      params.push(`%${to}%`);
      query += ` AND arrival_airport ILIKE $${params.length}`;
    }

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    } else if (!status || status !== 'all') {
      query += " AND status = 'active'";
    }

    query += ' ORDER BY price ASC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFlightById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM flights WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFlight = async (req, res) => {
  const { airline, flight_number, departure_airport, arrival_airport, departure_time, arrival_time, price, seats_available, status, provider_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO flights (airline, flight_number, departure_airport, arrival_airport, departure_time, arrival_time, price, seats_available, status, provider_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [airline, flight_number, departure_airport, arrival_airport, departure_time, arrival_time, price, seats_available || 0, status || 'active', provider_id || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFlight = async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  try {
    const setClause = Object.keys(fields)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    const values = Object.values(fields);

    if (values.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const result = await pool.query(
      `UPDATE flights SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFlight = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM flights WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }
    res.json({ success: true, message: 'Flight deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
