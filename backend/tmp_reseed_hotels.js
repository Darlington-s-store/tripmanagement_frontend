import pg from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

const HOTELS_DATA = [
    {
        name: "Kempinski Hotel Gold Coast City",
        location: "Accra",
        region: "Greater Accra",
        price_per_night: 2800,
        rating: 5.0,
        image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        images: JSON.stringify(["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800"]),
        description: "Luxury hotel located in the heart of Accra, featuring a gorgeous outdoor pool, exquisite dining, and world-class spa facilities.",
        amenities: "Free WiFi, Swimming Pool, Spa, Gym, Restaurant, Free Parking",
        total_rooms: 269
    },
    {
        name: "Labadi Beach Hotel",
        location: "Labadi, Accra",
        region: "Greater Accra",
        price_per_night: 2100,
        rating: 4.8,
        image_url: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800",
        images: JSON.stringify(["https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"]),
        description: "Ghana's premier luxury resort featuring stunning beach access, private terraces, and an ambiance of unparalleled relaxation.",
        amenities: "Beach Access, Free WiFi, Swimming Pool, Spa, Restaurant",
        total_rooms: 164
    },
    {
        name: "Zaina Lodge",
        location: "Mole National Park",
        region: "Northern",
        price_per_night: 3200,
        rating: 4.9,
        image_url: "https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=800",
        images: JSON.stringify(["https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=800", "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"]),
        description: "West Africa's first luxury safari lodge offering unparalleled views of the beautiful Mole National Park and elephant sightings from the infinity pool.",
        amenities: "Safari Tours, Swimming Pool, Restaurant, Bar, Free WiFi",
        total_rooms: 25
    },
    {
        name: "Lemon Beach Resort",
        location: "Elmina",
        region: "Central",
        price_per_night: 1100,
        rating: 4.4,
        image_url: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
        images: JSON.stringify(["https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800", "https://images.unsplash.com/photo-1551882547-ff40c0d129df?w=800"]),
        description: "Beautiful relaxing beach resort that boasts exceptional views of the historic Elmina Castle and authentic Ghanaian hospitality.",
        amenities: "Beach Access, Swimming Pool, Bar, Restaurant, Parking",
        total_rooms: 40
    },
    {
        name: "Royal Senchi Resort",
        location: "Akosombo",
        region: "Eastern",
        price_per_night: 2400,
        rating: 4.6,
        image_url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800",
        images: JSON.stringify(["https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800", "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800"]),
        description: "A luxury resort perched along the Volta River, featuring unique riverfront scenery, boat cruises, and an eco-friendly aesthetic.",
        amenities: "River Access, Swimming Pool, Spa, Tennis Court, Restaurant",
        total_rooms: 84
    }
];

async function reseedHotels() {
    try {
        const client = await pool.connect();
        try {
            console.log("Beginning hotel reseeding process...");
            await client.query('BEGIN');

            // Find foreign key relations inside bookings to prevent constraint errors
            // Removed booking/review deletions because of missing column error

            console.log("Deleting hotel rooms...");
            await client.query('DELETE FROM hotel_rooms');

            console.log("Deleting hotels...");
            await client.query('DELETE FROM hotels');

            console.log(`Inserting ${HOTELS_DATA.length} new hotels...`);
            
            for (const hotel of HOTELS_DATA) {
                const hotelId = uuidv4();
                await client.query(
                    `INSERT INTO hotels (id, name, location, region, price_per_night, rating, image_url, images, description, amenities, total_rooms, available_rooms, created_at, updated_at) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                    [
                        hotelId, 
                        hotel.name, 
                        hotel.location, 
                        hotel.region, 
                        hotel.price_per_night, 
                        hotel.rating, 
                        hotel.image_url, 
                        hotel.images, 
                        hotel.description, 
                        hotel.amenities, 
                        hotel.total_rooms, 
                        hotel.total_rooms // assuming all are available
                    ]
                );
                
                // Add two dummy room types per hotel for realism
                const standardRoomId = uuidv4();
                await client.query(
                    `INSERT INTO hotel_rooms (id, hotel_id, room_type, price_per_night, capacity, available_count, amenities, description, images)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        standardRoomId,
                        hotelId,
                        "Standard Room",
                        hotel.price_per_night,
                        2,
                        Math.floor(hotel.total_rooms * 0.7), // 70% standard
                        "Wifi, AC, TV",
                        "A standard spacious room.",
                        JSON.stringify([])
                    ]
                );

                const suiteRoomId = uuidv4();
                await client.query(
                    `INSERT INTO hotel_rooms (id, hotel_id, room_type, price_per_night, capacity, available_count, amenities, description, images)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        suiteRoomId,
                        hotelId,
                        "Executive Suite",
                        hotel.price_per_night * 2.5,
                        4,
                        Math.floor(hotel.total_rooms * 0.1), // 10% suites
                        "Wifi, AC, Minibar, Ocean View, King Bed",
                        "A luxurious suite with amazing amenities.",
                        JSON.stringify([])
                    ]
                );
            }

            await client.query('COMMIT');
            console.log("Successfully reseeded hotels and recreated dummy rooms!");

        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Error reseeding hotels, rolling back:", error);
        } finally {
            client.release();
        }
    } catch (e) {
        console.error("Pool connection error:", e);
    } finally {
        await pool.end();
    }
}

reseedHotels();
