import pool from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export async function getTransportServices(req, res) {
    const { type, from, to, operator } = req.query;
    const client = await pool.connect();
    try {
        let query = 'SELECT * FROM transport_services WHERE status = \'active\'';
        const params = [];

        if (type) {
            params.push(type);
            query += ` AND type = $${params.length}`;
        }

        if (from) {
            params.push(`%${from}%`);
            query += ` AND from_location ILIKE $${params.length}`;
        }

        if (to) {
            params.push(`%${to}%`);
            query += ` AND to_location ILIKE $${params.length}`;
        }

        if (operator) {
            params.push(`%${operator}%`);
            query += ` AND operator ILIKE $${params.length}`;
        }

        query += ' ORDER BY price ASC';

        const result = await client.query(query, params);
        res.json({ success: true, data: result.rows });
    } finally {
        client.release();
    }
}

export async function getTransportById(req, res) {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM transport_services WHERE id = $1', [id]);
        if (result.rows.length === 0) throw new NotFoundError('Transport service not found');
        res.json({ success: true, data: result.rows[0] });
    } finally {
        client.release();
    }
}
