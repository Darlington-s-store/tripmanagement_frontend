import pg from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

async function seedRealData() {
    const client = await pool.connect();
    try {
        console.log('Starting high-quality seeding...');
        await client.query('BEGIN');

        // 1. Create a regular user for demo trips
        const userEmail = 'traveler@example.com';
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash('Traveler123!', salt);
        const userCheck = await client.query('SELECT id FROM users WHERE email = $1', [userEmail]);
        let userId;
        if (userCheck.rows.length === 0) {
            const userRes = await client.query(
                "INSERT INTO users (id, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id",
                [uuidv4(), userEmail, hashedPass, 'Kofi Traveler', 'user']
            );
            userId = userRes.rows[0].id;
        } else {
            userId = userCheck.rows[0].id;
        }

        // 2. Get Categories
        const catResult = await client.query('SELECT id, name FROM trip_categories');
        const categories = {};
        catResult.rows.forEach(c => categories[c.name] = c.id);

        // 3. Destinations
        const destinations = [
            { name: "Cape Coast Castle", region: "Central", category: "Historical", description: "A UNESCO World Heritage site, this castle was used as a major hub for the transatlantic slave trade.", image_url: "/placeholder-destination.jpg", fee: "GH₵ 50" },
            { name: "Kakum National Park", region: "Central", category: "Adventure", description: "Famous for its canopy walkway, one of the few in Africa, offering a breathtaking view of the rainforest.", image_url: "/placeholder-destination.jpg", fee: "GH₵ 60" },
            { name: "Mole National Park", region: "Savannah", category: "Wildlife", description: "Ghana's largest wildlife park, where you can see elephants, baboons, and antelopes on guided safaris.", image_url: "/placeholder-destination.jpg", fee: "GH₵ 40" },
            { name: "Wli Waterfalls", region: "Volta", category: "Adventure", description: "The highest waterfalls in West Africa, set in a scenic landscape of mountains and lush greenery.", image_url: "/placeholder-destination.jpg", fee: "GH₵ 30" }
        ];

        for (const dest of destinations) {
            await client.query(
                `INSERT INTO destinations (id, name, region, category_id, description, image_url, entrance_fee, rating, status) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'published') ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description`,
                [uuidv4(), dest.name, dest.region, categories[dest.category] || null, dest.description, dest.image_url, dest.fee, (Math.random() * 1 + 4).toFixed(1)]
            );
        }

        // 4. Tour Guides
        const guides = [
            {
                name: "Kojo Afriyie",
                experience_years: 15,
                languages: "English, Twi, Ga",
                hourly_rate: 150.00,
                bio: "Expert in wildlife and Ashanti history. Lead guide for many royal and safari expeditions.",
                rating: 4.9,
                image_url: "/placeholder-destination.jpg"
            },
            {
                name: "Ama Amponsah",
                experience_years: 8,
                languages: "English, French, Twi",
                hourly_rate: 120.00,
                bio: "Passionate about adventure and canopy hiking. I'll make your Kakum experience unforgettable.",
                rating: 5.0,
                image_url: "/placeholder-destination.jpg"
            }
        ];

        for (const guide of guides) {
            await client.query(
                `INSERT INTO tour_guides (id, name, experience_years, languages, hourly_rate, bio, rating, availability, image_url) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'Available', $8) ON CONFLICT DO NOTHING`,
                [uuidv4(), guide.name, guide.experience_years, guide.languages, guide.hourly_rate, guide.bio, guide.rating, guide.image_url]
            );
        }

        // 5. Sample Trips for Admin Demo
        const trips = [
            {
                destination: "Cape Coast Heritage Tour",
                description: "Historical exploration of Cape Coast and Kakum.",
                start_date: '2026-05-10',
                end_date: '2026-05-15',
                budget: 1500,
                status: 'pending'
            },
            {
                destination: "Mole Wildlife Safari",
                description: "A trip to see elephants and enjoy the savannah.",
                start_date: '2026-06-20',
                end_date: '2026-06-25',
                budget: 3500,
                status: 'approved'
            }
        ];

        for (const trip of trips) {
            await client.query(
                `INSERT INTO trips (id, user_id, destination, description, start_date, end_date, budget, status, is_public, is_featured) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, true)`,
                [uuidv4(), userId, trip.destination, trip.description, trip.start_date, trip.end_date, trip.budget, trip.status]
            );
        }

        await client.query('COMMIT');
        console.log('High-quality seeding with demo user and trips completed!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error during seeding:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

seedRealData();
