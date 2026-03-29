import pool from './src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

async function seedPublishedReviews() {
    try {
        // Get some completed bookings
        const bookings = await pool.query("SELECT id, user_id FROM bookings WHERE status = 'completed' LIMIT 3");

        if (bookings.rows.length === 0) {
            console.log('No completed bookings found to attach reviews to.');
            return;
        }

        for (let i = 0; i < bookings.rows.length; i++) {
            const b = bookings.rows[i];
            const titles = ['Amazing Stay!', 'Great Tour Guide', 'Smooth Transport'];
            const comments = [
                'The hospitality at the resort was top-notch. Highly recommended for families!',
                'Our guide was so knowledgeable about the history of the Cape Coast Castle.',
                'The VIP bus was on time and very comfortable for the long trip to Kumasi.'
            ];

            await pool.query(
                `INSERT INTO reviews (id, user_id, booking_id, rating, title, comment, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT DO NOTHING`,
                [uuidv4(), b.user_id, b.id, 5, titles[i], comments[i], 'published']
            );
        }

        console.log('Seed reviews created and published!');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

seedPublishedReviews();
