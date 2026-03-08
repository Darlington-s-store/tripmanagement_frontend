import pool from '../config/database.js';

export async function getDestinations(req, res) {
    const { category, region, search } = req.query;
    const client = await pool.connect();
    try {
        let query = `
      SELECT d.*, c.name as category_name 
      FROM destinations d
      LEFT JOIN trip_categories c ON d.category_id = c.id
      WHERE d.status = 'published'
    `;
        const params = [];

        if (category && category !== 'all') {
            params.push(category);
            query += ` AND c.name ILIKE $${params.length}`;
        }

        if (region && region !== 'All Regions') {
            params.push(region);
            query += ` AND d.region = $${params.length}`;
        }

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (d.name ILIKE $${params.length} OR d.description ILIKE $${params.length})`;
        }

        query += ' ORDER BY d.rating DESC';

        const result = await client.query(query, params);
        res.json({ success: true, data: result.rows });
    } finally {
        client.release();
    }
}

export async function getDestinationById(req, res) {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        const destination = await client.query(`
      SELECT d.*, c.name as category_name 
      FROM destinations d
      LEFT JOIN trip_categories c ON d.category_id = c.id
      WHERE d.id = $1
    `, [id]);

        if (destination.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Destination not found' });
        }

        const attractions = await client.query('SELECT * FROM attractions WHERE destination_id = $1 AND status = \'published\'', [id]);
        const itineraries = await client.query('SELECT * FROM suggested_itineraries WHERE destination_id = $1', [id]);

        res.json({
            success: true,
            data: {
                ...destination.rows[0],
                attractions: attractions.rows,
                itineraries: itineraries.rows,
            },
        });
    } finally {
        client.release();
    }
}


export async function getCategories(req, res) {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM trip_categories ORDER BY name ASC');
        res.json({ success: true, data: result.rows });
    } finally {
        client.release();
    }
}

export async function searchAttractions(req, res) {
    const { search, category } = req.query;
    const client = await pool.connect();
    try {
        let query = 'SELECT a.*, d.name as destination_name FROM attractions a JOIN destinations d ON a.destination_id = d.id WHERE a.status = \'published\'';
        const params = [];

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (a.name ILIKE $${params.length} OR a.description ILIKE $${params.length} OR d.name ILIKE $${params.length})`;
        }

        if (category && category !== 'all') {
            params.push(category);
            query += ` AND a.category ILIKE $${params.length}`;
        }

        const result = await client.query(query, params);
        res.json({ success: true, data: result.rows });
    } finally {
        client.release();
    }
}
