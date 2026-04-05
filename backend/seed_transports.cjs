require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const transports = [
  {
    name: "VIP Executive Bus",
    type: "Bus",
    operator: "VIP JEOUN Transport",
    from_location: "Accra",
    to_location: "Kumasi",
    departure_time: "08:00",
    arrival_time: "13:00",
    price: 150,
    capacity: 45,
    status: "active",
    image_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=60"
  },
  {
    name: "Domestic Flight - AWA102",
    type: "Flight",
    operator: "Africa World Airlines",
    from_location: "Accra",
    to_location: "Tamale",
    departure_time: "10:30",
    arrival_time: "11:45",
    price: 850,
    capacity: 50,
    status: "active",
    image_url: "https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?w=800&auto=format&fit=crop&q=60"
  },
  {
    name: "Inter-City Express",
    type: "Bus",
    operator: "STC",
    from_location: "Accra",
    to_location: "Takoradi",
    departure_time: "06:30",
    arrival_time: "10:00",
    price: 120,
    capacity: 40,
    status: "active",
    image_url: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=60"
  },
  {
    name: "Luxury Coach",
    type: "Bus",
    operator: "VVIP Transport",
    from_location: "Kumasi",
    to_location: "Accra",
    departure_time: "14:00",
    arrival_time: "19:00",
    price: 160,
    capacity: 45,
    status: "active",
    image_url: "https://images.unsplash.com/photo-1518174092601-52ea4101e40a?w=800&auto=format&fit=crop&q=60"
  }
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding transport services...');
    
    // Create table if not exists as a safeguard
    await client.query(`
      CREATE TABLE IF NOT EXISTS transport_services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        operator VARCHAR(255) NOT NULL,
        from_location VARCHAR(255) NOT NULL,
        to_location VARCHAR(255) NOT NULL,
        departure_time TIME NOT NULL,
        arrival_time TIME NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        capacity INTEGER NOT NULL,
        image_url TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    for (const t of transports) {
      await client.query(
        `INSERT INTO transport_services (name, type, operator, from_location, to_location, departure_time, arrival_time, price, capacity, status, image_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [t.name, t.type, t.operator, t.from_location, t.to_location, t.departure_time, t.arrival_time, t.price, t.capacity, t.status, t.image_url]
      );
    }
    console.log('Successfully seeded transport services!');
  } catch (err) {
    console.error('Error seeding:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
