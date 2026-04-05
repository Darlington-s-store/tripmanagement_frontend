import pool from './src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

const transports = [
  {
    name: 'VIP Executive Bus',
    type: 'Bus',
    operator: 'VIP JEOUN Transport',
    from: 'Accra',
    to: 'Kumasi',
    dep: '08:00 AM',
    arr: '01:00 PM',
    price: 150.00,
    capacity: 45,
    img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'
  },
  {
    name: 'Accra-Tamale Jet',
    type: 'Flight',
    operator: 'Passion Air',
    from: 'Accra',
    to: 'Tamale',
    dep: '10:30 AM',
    arr: '11:45 AM',
    price: 850.00,
    capacity: 50,
    img: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?w=800'
  }
];

const mockReviews = [
  {
    full_name: 'Adwoa Mansa',
    location: 'Cape Coast, Ghana',
    rating: 5,
    comment: 'TripEase helped me find the best hotel in Mole Park. The booking was so fast!',
    status: 'published'
  },
  {
    full_name: 'John Doe',
    location: 'Accra, Ghana',
    rating: 4,
    comment: 'Great interface. Booking my intercity bus was finally easy.',
    status: 'published'
  }
];

async function seedData() {
    try {
        console.log('🌱 Starting database seeding...');

        // Seed Transports
        for (const t of transports) {
            await pool.query(
                `INSERT INTO transport_services (id, name, type, operator, from_location, to_location, departure_time, arrival_time, price, capacity, image_url, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                 ON CONFLICT DO NOTHING`,
                [uuidv4(), t.name, t.type, t.operator, t.from, t.to, t.dep, t.arr, t.price, t.capacity, t.img, 'active']
            );
        }
        console.log('✅ Transports seeded');

        // Seed Reviews
        for (const r of mockReviews) {
            await pool.query(
                `INSERT INTO reviews (id, full_name, location, rating, comment, status)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT DO NOTHING`,
                [uuidv4(), r.full_name, r.location, r.rating, r.comment, r.status]
            );
        }
        console.log('✅ Reviews seeded');

        console.log('🎉 Seeding complete!');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        process.exit();
    }
}

seedData();
