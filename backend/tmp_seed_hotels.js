import pool from './src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

async function seedRealHotels() {
    const client = await pool.connect();
    try {
        console.log('Seeding real hotels...');

        const hotels = [
            // Accra
            { name: "Kempinski Hotel Gold Coast City", location: "Ministries, Accra", region: "Greater Accra", price: 4850, rating: 5.0, description: "Luxury 5-star hotel in the heart of the city." },
            { name: "Labadi Beach Hotel", location: "La, Accra", region: "Greater Accra", price: 3200, rating: 5.0, description: "Ghana's premier five-star hotel by the beach." },
            { name: "Movenpick Ambassador Hotel", location: "Ministries, Accra", region: "Greater Accra", price: 3500, rating: 5.0, description: "Urban oasis in the historical district." },
            { name: "Alisa Hotel North Ridge", location: "North Ridge, Accra", region: "Greater Accra", price: 1800, rating: 4.5, description: "Contemporary luxury with exceptional service." },
            { name: "Fiesta Royale Hotel", location: "Dzorwulu, Accra", region: "Greater Accra", price: 2100, rating: 4.5, description: "Elegant hotel perfect for business and leisure." },
            { name: "Airport View Hotel", location: "Airport Area, Accra", region: "Greater Accra", price: 1400, rating: 4.0, description: "Conveniently located near the airport." },

            // Cape Coast / Elmina
            { name: "Ridge Royal Hotel", location: "Cape Coast", region: "Central", price: 1200, rating: 4.5, description: "Modern comfort in the historic capital." },
            { name: "Coconut Grove Beach Resort", location: "Elmina", region: "Central", price: 1500, rating: 4.5, description: "Beautiful resort along the gold coast." },
            { name: "Oasis Beach Resort", location: "Cape Coast", region: "Central", price: 350, rating: 3.5, description: "Budget-friendly beach resort." },
            { name: "Hans Cottage Botel", location: "Effutu, Cape Coast", region: "Central", price: 650, rating: 3.5, description: "Stay over a crocodile pond – a unique experience." },
            { name: "Marrets International Hotel", location: "Cape Coast", region: "Central", price: 850, rating: 4.0, description: "International standard in Cape Coast." },

            // Takoradi
            { name: "Best Western Plus Atlantic Hotel", location: "Takoradi", region: "Western", price: 1950, rating: 4.5, description: "Top-tier accommodation in the Oil City." },
            { name: "Planters Lodge", location: "Takoradi", region: "Western", price: 1600, rating: 4.5, description: "Colonial style charm with modern luxury." },
            { name: "Alliance by Eagles", location: "Takoradi", region: "Western", price: 1750, rating: 4.5, description: "Modern and sophisticated hotel experience." },
            { name: "Abuesi Beach Resort", location: "Abuesi", region: "Western", price: 1100, rating: 4.0, description: "Serene beach retreat." }
        ];

        for (const hotel of hotels) {
            // Check if exists
            const exists = await client.query('SELECT id FROM hotels WHERE name = $1', [hotel.name]);
            if (exists.rows.length > 0) {
                // Update
                await client.query(
                    'UPDATE hotels SET location = $1, region = $2, price_per_night = $3, rating = $4, description = $5 WHERE name = $6',
                    [hotel.location, hotel.region, hotel.price, hotel.rating, hotel.description, hotel.name]
                );
                console.log(`Updated ${hotel.name}`);
            } else {
                // Insert
                await client.query(
                    'INSERT INTO hotels (id, name, location, region, price_per_night, rating, description, amenities) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                    [uuidv4(), hotel.name, hotel.location, hotel.region, hotel.price, hotel.rating, hotel.description, 'WiFi, Parking, AC']
                );
                console.log(`Inserted ${hotel.name}`);
            }
        }

        console.log('Seeding complete.');
    } catch (error) {
        console.error('Error seeding hotels:', error);
    } finally {
        client.release();
        process.exit();
    }
}

seedRealHotels();
