import pool from './src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

async function seedHotelsWithRooms() {
    const client = await pool.connect();
    try {
        console.log('Cleaning up existing hotels and rooms...');
        await client.query('BEGIN');
        
        // Due to cascade delete, deleting hotels will delete rooms
        await client.query('DELETE FROM hotels');
        console.log('Cleared existing hotels.');

        const hotelsData = [
            {
                name: "Mövenpick Ambassador Hotel Accra",
                location: "Accra",
                region: "Greater Accra",
                price: 4500,
                rating: 5.0,
                description: "5-star luxury hotel in central Accra. Large pool, business facilities, near airport and ministries.",
                amenities: "Pool, WiFi, Gym, Spa, Business Center, Parking",
                image_url: "/placeholder-destination.jpg",
                rooms: [
                    { type: "Superior Room", price: 4500, capacity: 2, count: 20, description: "Elegant room with city view." },
                    { type: "Executive Suite", price: 8500, capacity: 2, count: 5, description: "Spacious suite with lounge access." },
                    { type: "Presidential Suite", price: 15000, capacity: 4, count: 1, description: "Ultimate luxury experience." }
                ]
            },
            {
                name: "Kempinski Hotel Gold Coast City",
                location: "Accra",
                region: "Greater Accra",
                price: 5200,
                rating: 5.0,
                description: "The height of luxury in the heart of the city. Ultra-modern amenities and world-class service.",
                amenities: "Infinite Pool, WiFi, Luxury Spa, Fine Dining, Helipad",
                image_url: "/placeholder-destination.jpg",
                rooms: [
                    { type: "Deluxe King", price: 5200, capacity: 2, count: 15, description: "Modern comfort with premium linens." },
                    { type: "Junior Suite", price: 9000, capacity: 2, count: 10, description: "Separate living area, city views." },
                    { type: "Royal Suite", price: 20000, capacity: 4, count: 2, description: "Bespoke service and unparalleled luxury." }
                ]
            },
            {
                name: "Labadi Beach Hotel",
                location: "Accra",
                region: "Greater Accra",
                price: 3800,
                rating: 5.0,
                description: "Ghana's premier beach resort. Tropical gardens and private beach access.",
                amenities: "Beach Access, Multiple Pools, Tennis Courts, WiFi, Bar",
                image_url: "/placeholder-destination.jpg",
                rooms: [
                    { type: "Ocean View Room", price: 3800, capacity: 2, count: 25, description: "Wake up to the sound of the Atlantic." },
                    { type: "Garden Villa", price: 6500, capacity: 3, count: 8, description: "Private villa surrounded by tropical plants." }
                ]
            },
            {
                name: "Royal Senchi Resort",
                location: "Akosombo",
                region: "Eastern",
                price: 4200,
                rating: 5.0,
                description: "Luxury riverside resort on the banks of the Volta River.",
                amenities: "Boat Rides, River View, WiFi, Pool, Mini Golf",
                image_url: "/placeholder-destination.jpg",
                rooms: [
                    { type: "Riverside Deluxe", price: 4200, capacity: 2, count: 12, description: "Balcony overlooking the Volta River." },
                    { type: "Senchi Suite", price: 7500, capacity: 2, count: 4, description: "Traditional architecture with modern luxury." }
                ]
            },
            {
                name: "Coconut Grove Beach Resort",
                location: "Elmina",
                region: "Central",
                price: 1800,
                rating: 4.5,
                description: "Eco-friendly resort with a golf course and organic farm.",
                amenities: "Golf Course, WiFi, Beach Access, Horse Riding, Organic Restaurant",
                image_url: "/placeholder-destination.jpg",
                rooms: [
                    { type: "Standard Room", price: 1800, capacity: 2, count: 15, description: "Comfortable room near the beach." },
                    { type: "Executive Room", price: 2800, capacity: 2, count: 5, description: "Upgraded amenities and better views." }
                ]
            },
            {
                name: "Golden Tulip Kumasi",
                location: "Kumasi",
                region: "Ashanti",
                price: 2200,
                rating: 4.5,
                description: "Central business hotel with excellent conferencing facilities.",
                amenities: "Business Center, Pool, WiFi, Casino, Gym",
                image_url: "/placeholder-destination.jpg",
                rooms: [
                    { type: "Standard Twin", price: 2200, capacity: 2, count: 20, description: "Ideal for business travelers." },
                    { type: "Business Suite", price: 4000, capacity: 2, count: 6, description: "Integrated workspace and lounge." }
                ]
            }
        ];

        for (const h of hotelsData) {
            const hotelId = uuidv4();
            const totalRooms = h.rooms.reduce((sum, r) => sum + r.count, 0);
            
            await client.query(
                `INSERT INTO hotels (id, name, location, region, price_per_night, rating, description, amenities, total_rooms, available_rooms, image_url) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [hotelId, h.name, h.location, h.region, h.price, h.rating, h.description, h.amenities, totalRooms, totalRooms, h.image_url]
            );

            for (const r of h.rooms) {
                await client.query(
                    `INSERT INTO hotel_rooms (id, hotel_id, room_type, price_per_night, capacity, available_count, description) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [uuidv4(), hotelId, r.type, r.price, r.capacity, r.count, r.description]
                );
            }
            console.log(`Seeded Hotel: ${h.name} with ${h.rooms.length} room types.`);
        }

        await client.query('COMMIT');
        console.log('Hotel and Room seeding completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error seeding hotels and rooms:', error);
    } finally {
        client.release();
        process.exit();
    }
}

seedHotelsWithRooms();
