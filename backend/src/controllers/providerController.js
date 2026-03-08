import pool from '../config/database.js';
import { UnauthorizedError, NotFoundError } from '../utils/errors.js';

export async function getProviderDashboard(req, res) {
    if (!req.user) throw new UnauthorizedError('Not authenticated');

    const client = await pool.connect();
    try {
        // Get provider ID for this user
        const providerResult = await client.query('SELECT id FROM providers WHERE user_id = $1', [req.user.id]);
        if (providerResult.rows.length === 0) {
            return res.json({
                success: true,
                data: {
                    totalBookings: 0,
                    activeListings: 0,
                    avgRating: 0,
                    totalRevenue: 0,
                    listings: [],
                    recentBookings: []
                }
            });
        }

        const providerId = providerResult.rows[0].id;

        // Get listings (hotels, guides, transport)
        const [hotels, guides, transport] = await Promise.all([
            client.query('SELECT id, name, status, rating, (SELECT COUNT(*) FROM bookings WHERE reference_id = hotels.id) as booking_count FROM hotels WHERE provider_id = $1', [providerId]),
            client.query('SELECT id, name, status, rating, (SELECT COUNT(*) FROM bookings WHERE reference_id = tour_guides.id) as booking_count FROM tour_guides WHERE provider_id = $1', [providerId]),
            client.query('SELECT id, name, status, (SELECT COUNT(*) FROM bookings WHERE reference_id = transport_services.id) as booking_count FROM transport_services WHERE provider_id = $1', [providerId])
        ]);

        // Get bookings for these listings
        const bookings = await client.query(`
      SELECT b.id, u.full_name as guest, b.booking_type, b.total_price as amount, b.status, b.created_at, b.check_in_date, b.check_out_date,
             COALESCE(h.name, g.name, t.name) as service_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN hotels h ON b.reference_id = h.id AND b.booking_type = 'hotel'
      LEFT JOIN tour_guides g ON b.reference_id = g.id AND b.booking_type = 'guide'
      LEFT JOIN transport_services t ON b.reference_id = t.id AND b.booking_type = 'transport'
      WHERE h.provider_id = $1 OR g.provider_id = $1 OR t.provider_id = $1
      ORDER BY b.created_at DESC
      LIMIT 5
    `, [providerId]);

        // Calculate stats
        const totalBookings = hotels.rows.reduce((sum, h) => sum + parseInt(h.booking_count), 0) +
            guides.rows.reduce((sum, g) => sum + parseInt(g.booking_count), 0) +
            transport.rows.reduce((sum, t) => sum + parseInt(t.booking_count), 0);

        const activeListings = hotels.rows.filter(h => h.status === 'active').length +
            guides.rows.filter(g => g.status === 'active').length +
            transport.rows.filter(t => t.status === 'active').length;

        const allRatings = [...hotels.rows, ...guides.rows].map(l => parseFloat(l.rating || 0)).filter(r => r > 0);
        const avgRating = allRatings.length > 0 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0;

        const totalRevenueResult = await client.query(`
      SELECT SUM(total_price) as total 
      FROM bookings b
      LEFT JOIN hotels h ON b.reference_id = h.id AND b.booking_type = 'hotel'
      LEFT JOIN tour_guides g ON b.reference_id = g.id AND b.booking_type = 'guide'
      LEFT JOIN transport_services t ON b.reference_id = t.id AND b.booking_type = 'transport'
      WHERE (h.provider_id = $1 OR g.provider_id = $1 OR t.provider_id = $1) AND b.status = 'confirmed'
    `, [providerId]);

        res.json({
            success: true,
            data: {
                totalBookings,
                activeListings,
                avgRating,
                totalRevenue: parseFloat(totalRevenueResult.rows[0].total || 0),
                listings: [
                    ...hotels.rows.map(h => ({ ...h, type: 'Hotel' })),
                    ...guides.rows.map(g => ({ ...g, type: 'Guide' })),
                    ...transport.rows.map(t => ({ ...t, type: 'Transport' }))
                ],
                recentBookings: bookings.rows
            }
        });
    } finally {
        client.release();
    }
}

export async function getProviderListings(req, res) {
    if (!req.user) throw new UnauthorizedError('Not authenticated');

    const client = await pool.connect();
    try {
        const providerResult = await client.query('SELECT id FROM providers WHERE user_id = $1', [req.user.id]);
        if (providerResult.rows.length === 0) return res.json({ success: true, data: [] });

        const providerId = providerResult.rows[0].id;

        const [hotels, guides, transport] = await Promise.all([
            client.query('SELECT id, name, location, status, rating, price_per_night as price, created_at FROM hotels WHERE provider_id = $1', [providerId]),
            client.query('SELECT id, name, status, rating, hourly_rate as price, created_at FROM tour_guides WHERE provider_id = $1', [providerId]),
            client.query('SELECT id, name, type as location, status, 0 as rating, price as price, created_at FROM transport_services WHERE provider_id = $1', [providerId])
        ]);

        res.json({
            success: true,
            data: [
                ...hotels.rows.map(h => ({ ...h, type: 'Hotel' })),
                ...guides.rows.map(g => ({ ...g, type: 'Guide' })),
                ...transport.rows.map(t => ({ ...t, type: 'Transport' }))
            ]
        });
    } finally {
        client.release();
    }
}

export async function getProviderBookings(req, res) {
    if (!req.user) throw new UnauthorizedError('Not authenticated');

    const client = await pool.connect();
    try {
        const providerResult = await client.query('SELECT id FROM providers WHERE user_id = $1', [req.user.id]);
        if (providerResult.rows.length === 0) return res.json({ success: true, data: [] });

        const providerId = providerResult.rows[0].id;

        const result = await client.query(`
      SELECT b.*, u.full_name as guest_name, u.email as guest_email,
             COALESCE(h.name, g.name, t.name) as service_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN hotels h ON b.reference_id = h.id AND b.booking_type = 'hotel'
      LEFT JOIN tour_guides g ON b.reference_id = g.id AND b.booking_type = 'guide'
      LEFT JOIN transport_services t ON b.reference_id = t.id AND b.booking_type = 'transport'
      WHERE h.provider_id = $1 OR g.provider_id = $1 OR t.provider_id = $1
      ORDER BY b.created_at DESC
    `, [providerId]);

        res.json({ success: true, data: result.rows });
    } finally {
        client.release();
    }
}
