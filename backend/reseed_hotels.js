import pool from './src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

async function reseedHotels() {
    const client = await pool.connect();
    try {
        console.log('--- RESEEDING HOTELS ---');
        
        // 1. Clear existing data
        console.log('Cleaning existing hotel data...');
        await client.query('DELETE FROM hotel_rooms');
        await client.query('DELETE FROM hotels');
        
        // 2. Sample high-quality hotels
        const hotels = [
            {
                name: "The Royal Senchi Resort",
                location: "Akosombo",
                region: "Eastern",
                price: 2500,
                rating: 5.0,
                description: "Luxurious resort by the Volta River with breathtaking views and premium amenities.",
                total_rooms: 84,
                imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
                amenities: "Volta View, Pool, Spa, Private Boat, WiFi, AC"
            },
            {
                name: "Kempinski Hotel Gold Coast City",
                location: "Greater Accra",
                region: "Greater Accra",
                price: 4850,
                rating: 5.0,
                description: "The crown jewel of Accra's hospitality, offering unmatched luxury and service.",
                total_rooms: 269,
                imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
                amenities: "City View, Rooftop Pool, Spa, Gym, Business Suite"
            },
            {
                name: "Coconut Grove Beach Resort",
                location: "Elmina",
                region: "Central",
                price: 1800,
                rating: 4.5,
                description: "A serene beach resort near Elmina Castle, famous for its golf course and sandy beaches.",
                total_rooms: 55,
                imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
                amenities: "Beachfront, Golf, Pool, Restaurant, AC"
            },
            {
                name: "Zaina Lodge",
                location: "Mole National Park",
                region: "Northern",
                price: 3200,
                rating: 4.8,
                description: "West Africa's first luxury safari lodge, overlooking two watering holes where elephants frequent.",
                total_rooms: 25,
                imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
                amenities: "Safari Tours, Infinity Pool, Park View, WiFi, AC"
            },
            {
                name: "Lou Moon Resort",
                location: "Axim",
                region: "Western",
                price: 2800,
                rating: 4.9,
                description: "Exceptional boutique resort nestled within a private bay, surrounded by lush forest.",
                total_rooms: 18,
                imageUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80",
                amenities: "Private Bay, Kayaking, Secluded, Spa, Fine Dining"
            }
        ];

        for (const h of hotels) {
            const hotelId = uuidv4();
            console.log(`Inserting Hotel: ${h.name}`);
            
            await client.query(
                `INSERT INTO hotels (id, name, location, region, price_per_night, rating, description, total_rooms, available_rooms, image_url, amenities)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [hotelId, h.name, h.location, h.region, h.price, h.rating, h.description, h.total_rooms, h.total_rooms, h.imageUrl, h.amenities]
            );

            // Add sample room types for each
            const roomTypes = [
                { type: "Standard Oasis", price: h.price, cap: 2, count: Math.ceil(h.total_rooms * 0.6) },
                { type: "Executive Suite", price: Math.round(h.price * 1.5), cap: 2, count: Math.ceil(h.total_rooms * 0.3) },
                { type: "Presidential Villa", price: Math.round(h.price * 2.5), cap: 4, count: Math.max(1, Math.floor(h.total_rooms * 0.1)) }
            ];

            for (const r of roomTypes) {
                await client.query(
                    `INSERT INTO hotel_rooms (id, hotel_id, room_type, price_per_night, capacity, available_count, amenities)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [uuidv4(), hotelId, r.type, r.price, r.cap, r.count, "AC, WiFi, Mini-bar, Room Service"]
                );
            }
        }

        console.log('--- RESEED COMPLETE ---');
    } catch (error) {
        console.error('Reseed failed:', error);
    } finally {
        client.release();
        process.exit();
    }
}

reseedHotels();
