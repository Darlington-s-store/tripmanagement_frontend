import pool from './src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

async function seedData() {
    const client = await pool.connect();
    try {
        console.log('Starting comprehensive seeding as requested...');

        // 1. Destinations
        const destinationsData = [
            { name: "Accra", region: "Greater Accra", description: "The bustling capital of Ghana" },
            { name: "Kumasi", region: "Ashanti", description: "The heart of the Ashanti Kingdom" },
            { name: "Cape Coast", region: "Central", description: "A city rich in colonial history" },
            { name: "Takoradi", region: "Western", description: "The oil city of Ghana" },
            { name: "Koforidua", region: "Eastern", description: "A quiet city surrounded by nature" },
            { name: "Ho", region: "Volta", description: "Capital of the Volta Region" },
            { name: "Tamale", region: "Northern", description: "The fastest growing city in West Africa" },
            { name: "Bolgatanga", region: "Upper East", description: "The crafts center of the north" },
            { name: "Axim", region: "Western North", description: "Coastal town with historic forts" },
        ];

        const destMap = {};
        for (const d of destinationsData) {
            let res = await client.query('SELECT id FROM destinations WHERE name = $1', [d.name]);
            let destId;
            if (res.rows.length === 0) {
                destId = uuidv4();
                await client.query(
                    'INSERT INTO destinations (id, name, region, description) VALUES ($1, $2, $3, $4)',
                    [destId, d.name, d.region, d.description]
                );
            } else {
                destId = res.rows[0].id;
            }
            destMap[d.name] = destId;
        }

        // 2. Hotels
        const hotels = [
            // Accra
            { name: "Mövenpick Ambassador Hotel Accra", city: "Accra", region: "Greater Accra", price: 4500, rating: 5.0, description: "5-star luxury hotel in central Accra. Large pool, business facilities, near airport and ministries", category: "Luxury" },
            { name: "Kempinski Hotel Gold Coast City", city: "Accra", region: "Greater Accra", price: 5000, rating: 5.0, description: "Ultra-luxury hotel. Conference center, fine dining, spa", category: "Luxury" },
            { name: "Labadi Beach Hotel", city: "Accra", region: "Greater Accra", price: 3500, rating: 5.0, description: "Beachfront resort. Popular for events and conferences", category: "Luxury" },
            { name: "La Villa Boutique Hotel", city: "Accra", region: "Greater Accra", price: 1800, rating: 4.5, description: "Cozy boutique", category: "Mid-range" },
            { name: "Roots Hotel Apartment", city: "Accra", region: "Greater Accra", price: 1500, rating: 4.0, description: "Long stay hotel", category: "Mid-range" },
            { name: "Somewhere Nice Hostel", city: "Accra", region: "Greater Accra", price: 400, rating: 4.0, description: "Backpacker-friendly", category: "Budget" },
            // Kumasi
            { name: "Golden Tulip Kumasi City (Lancaster)", city: "Kumasi", region: "Ashanti", price: 2000, rating: 4.5, description: "Business hotel, central location, pool", category: "Luxury" },
            { name: "Oak Plaza Suites", city: "Kumasi", region: "Ashanti", price: 1600, rating: 4.5, description: "Modern serviced apartments", category: "Mid-range" },
            { name: "Golden Bean Hotel", city: "Kumasi", region: "Ashanti", price: 1800, rating: 4.5, description: "Quiet environment, ideal for relaxation", category: "Mid-range" },
            { name: "Frederick's Lodge", city: "Kumasi", region: "Ashanti", price: 1200, rating: 4.0, description: "Boutique experience", category: "Mid-range" },
            // Cape Coast
            { name: "Coconut Grove Beach Resort", city: "Cape Coast", region: "Central", price: 1500, rating: 4.5, description: "Beachfront, colonial style, near Elmina Castle", category: "Mid-range" },
            { name: "Elmina Bay Resort", city: "Cape Coast", region: "Central", price: 1400, rating: 4.5, description: "Ocean views, peaceful environment", category: "Mid-range" },
            { name: "Hans Cottage Botel", city: "Cape Coast", region: "Central", price: 500, rating: 3.5, description: "Budget eco-hotel with crocodile pond", category: "Budget" },
            // Takoradi
            { name: "Best Western Plus Atlantic Hotel", city: "Takoradi", region: "Western", price: 2500, rating: 4.5, description: "Ocean view luxury, gym, pool", category: "Luxury" },
            { name: "Planters Lodge & Spa", city: "Takoradi", region: "Western", price: 1800, rating: 4.5, description: "Garden-style relaxation hotel", category: "Mid-range" },
            { name: "Asempa Hotel", city: "Takoradi", region: "Western", price: 900, rating: 3.5, description: "Standard business hotel", category: "Budget" },
            // Koforidua
            { name: "Senalli Hotel", city: "Koforidua", region: "Eastern", price: 900, rating: 4.0, description: "Modern, quiet environment with good service", category: "Mid-range" },
            { name: "Eastern Premier Hotel", city: "Koforidua", region: "Eastern", price: 1100, rating: 4.0, description: "Standard business hotel", category: "Mid-range" },
            { name: "Mac-Dic Royal Plaza Hotel", city: "Koforidua", region: "Eastern", price: 1000, rating: 4.0, description: "Mid-range accommodation", category: "Mid-range" },
            // Volta
            { name: "Royal Senchi Resort", city: "Ho", region: "Volta", price: 3000, rating: 5.0, description: "Luxury riverside resort on Volta River", category: "Luxury" },
            { name: "Volta Hotel", city: "Ho", region: "Volta", price: 1500, rating: 4.0, description: "Scenic views of Akosombo Dam", category: "Mid-range" },
            { name: "Wli Water Heights Hotel", city: "Ho", region: "Volta", price: 800, rating: 3.5, description: "Near Wli Waterfalls", category: "Budget" },
            // Other
            { name: "Zaina Lodge", city: "Tamale", region: "Northern", price: 2500, rating: 4.5, description: "Safari lodge near Mole Park", category: "Luxury" },
            { name: "Catering Rest House", city: "Bolgatanga", region: "Upper East", price: 400, rating: 3.0, description: "Rest house accommodation", category: "Budget" },
            { name: "Green Turtle Lodge", city: "Axim", region: "Western North", price: 600, rating: 4.0, description: "Eco-tourism lodge", category: "Budget" },
        ];

        for (const hotel of hotels) {
            const exists = await client.query('SELECT id FROM hotels WHERE name = $1', [hotel.name]);
            // Appending category to description to respect existing schema if we don't alter table
            const finalDesc = `${hotel.description} (Category: ${hotel.category})`;

            if (exists.rows.length > 0) {
                await client.query(
                    'UPDATE hotels SET location = $1, region = $2, price_per_night = $3, rating = $4, description = $5 WHERE name = $6',
                    [hotel.city, hotel.region, hotel.price, hotel.rating, finalDesc, hotel.name]
                );
                console.log(`Updated Hotel: ${hotel.name}`);
            } else {
                await client.query(
                    'INSERT INTO hotels (id, name, location, region, price_per_night, rating, description, amenities) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                    [uuidv4(), hotel.name, hotel.city, hotel.region, hotel.price, hotel.rating, finalDesc, 'WiFi, Parking, AC, Pool']
                );
                console.log(`Inserted Hotel: ${hotel.name}`);
            }
        }

        // 3. Attractions
        const attractions = [
            { name: "Independence Square", city: "Accra", region: "Greater Accra", description: "Historic public square and monument" },
            { name: "Kwame Nkrumah Mausoleum", city: "Accra", region: "Greater Accra", description: "Memorial to the first President of Ghana" },
            { name: "Labadi Beach", city: "Accra", region: "Greater Accra", description: "Popular coastal beach" },
            { name: "Manhyia Palace", city: "Kumasi", region: "Ashanti", description: "Seat of the Asantehene" },
            { name: "Kejetia Market", city: "Kumasi", region: "Ashanti", description: "Largest single market in West Africa" },
            { name: "Lake Bosomtwe", city: "Kumasi", region: "Ashanti", description: "Natural meteorite lake" },
            { name: "Cape Coast Castle", city: "Cape Coast", region: "Central", description: "Historic coastal fort" },
            { name: "Elmina Castle", city: "Cape Coast", region: "Central", description: "Oldest European building in sub-Saharan Africa" },
            { name: "Kakum National Park", city: "Cape Coast", region: "Central", description: "Rainforest with a canopy walkway" },
            { name: "Wli Waterfalls", city: "Ho", region: "Volta", description: "Highest waterfall in West Africa" },
            { name: "Mount Afadja", city: "Ho", region: "Volta", description: "Highest mountain in Ghana" },
            { name: "Tafi Atome Monkey Sanctuary", city: "Ho", region: "Volta", description: "Sacred monkey sanctuary" },
        ];

        for (const attr of attractions) {
            const destId = destMap[attr.city] || destMap["Accra"]; // Fallback to Accra if not found
            const exists = await client.query('SELECT id FROM attractions WHERE name = $1', [attr.name]);
            if (exists.rows.length > 0) {
                await client.query(
                    'UPDATE attractions SET description = $1, region = $2 WHERE name = $3',
                    [attr.description, attr.region, attr.name]
                );
                console.log(`Updated Attraction: ${attr.name}`);
            } else {
                await client.query(
                    'INSERT INTO attractions (id, destination_id, name, description, region, rating) VALUES ($1, $2, $3, $4, $5, $6)',
                    [uuidv4(), destId, attr.name, attr.description, attr.region, 4.5]
                );
                console.log(`Inserted Attraction: ${attr.name}`);
            }
        }

        console.log('Seeding complete.');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        client.release();
        process.exit();
    }
}

seedData();
