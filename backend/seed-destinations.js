import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

const destinations = [
    {
        name: "Cape Coast Castle", region: "Central", category: "Historical",
        description: "A UNESCO World Heritage Site and powerful monument to the transatlantic slave trade. An unmissable piece of Ghana's history.",
        image_url: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=600&q=80",
        entrance_fee: "GH₵ 50", opening_hours: "8am - 5pm", rating: 4.9, reviews_count: 1204,
        tags: ["UNESCO", "History", "Guided Tours"],
    },
    {
        name: "Kakum National Park", region: "Central", category: "Wildlife",
        description: "Famous for its canopy walkway suspended 30m above the forest floor, offering a thrilling walk through the rainforest canopy.",
        image_url: "https://images.unsplash.com/photo-1542401886-65d6c61db217?w=600&q=80",
        entrance_fee: "GH₵ 80", opening_hours: "7am - 6pm", rating: 4.7, reviews_count: 876,
        tags: ["Canopy Walk", "Wildlife", "Nature"],
    },
    {
        name: "Labadi Beach", region: "Greater Accra", category: "Beach",
        description: "Accra's most famous beach destination, perfect for swimming, relaxing and experiencing vibrant Ghanaian beach culture on weekends.",
        image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
        entrance_fee: "GH₵ 10", opening_hours: "All Day", rating: 4.3, reviews_count: 2341,
        tags: ["Swimming", "Food", "Entertainment"],
    },
    {
        name: "Ashanti Cultural Centre", region: "Ashanti", category: "Cultural",
        description: "Explore the rich Ashanti culture through traditional crafts, kente weaving demonstrations, and artifacts from the Ashanti Kingdom.",
        image_url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80",
        entrance_fee: "GH₵ 20", opening_hours: "9am - 5pm", rating: 4.5, reviews_count: 432,
        tags: ["Kente", "Crafts", "Culture"],
    },
    {
        name: "Elmina Castle", region: "Central", category: "Historical",
        description: "The oldest European building in sub-Saharan Africa, built by the Portuguese in 1482. A profound and moving historical landmark.",
        image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80",
        entrance_fee: "GH₵ 40", opening_hours: "9am - 5pm", rating: 4.8, reviews_count: 987,
        tags: ["UNESCO", "Colonial", "History"],
    },
    {
        name: "Mole National Park", region: "Northern", category: "Wildlife",
        description: "Ghana's largest wildlife refuge, home to elephants, antelopes, warthogs, baboons, and over 300 species of birds. A true safari experience.",
        image_url: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80",
        entrance_fee: "GH₵ 100", opening_hours: "6am - 6pm", rating: 4.6, reviews_count: 654,
        tags: ["Safari", "Elephants", "Wildlife"],
    },
    {
        name: "Wli Waterfalls", region: "Volta", category: "Wildlife",
        description: "The highest waterfall in West Africa, located in the Agumatsa Wildlife Sanctuary. A spectacular 2-hour hike leads to the falls.",
        image_url: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&q=80",
        entrance_fee: "GH₵ 30", opening_hours: "7am - 5pm", rating: 4.7, reviews_count: 521,
        tags: ["Hiking", "Waterfall", "Adventure"],
    },
    {
        name: "Accra Arts Centre", region: "Greater Accra", category: "Cultural",
        description: "A vibrant craft market where artisans sell authentic Ghanaian crafts including wood carvings, batik fabric, jewelry, and souvenirs.",
        image_url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80",
        entrance_fee: "Free", opening_hours: "8am - 6pm", rating: 4.2, reviews_count: 1102,
        tags: ["Shopping", "Crafts", "Art"],
    },
    {
        name: "Homowo Festival", region: "Greater Accra", category: "Cultural",
        description: "The Ga people's harvest festival celebrated with traditional foods, drumming, and dancing. Typically held between August and September.",
        image_url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80",
        entrance_fee: "Free", opening_hours: "Seasonal", rating: 4.8, reviews_count: 312,
        tags: ["Festival", "Culture", "Ga People"],
    },
];

async function seedDestinations() {
    try {
        const client = await pool.connect();
        try {
            // Get categories map
            const catResult = await client.query('SELECT id, name FROM trip_categories');
            const catMap = {};
            catResult.rows.forEach(row => {
                catMap[row.name] = row.id;
            });

            for (const d of destinations) {
                await client.query(
                    `INSERT INTO destinations (name, region, category_id, description, image_url, entrance_fee, opening_hours, rating, reviews_count, tags, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                     ON CONFLICT (name) DO NOTHING`,
                    [d.name, d.region, catMap[d.category] || null, d.description, d.image_url, d.entrance_fee, d.opening_hours, d.rating, d.reviews_count, d.tags, 'published']
                );
            }
            console.log('Seeded destinations successfully.');
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error seeding destinations:', error);
    } finally {
        await pool.end();
    }
}

seedDestinations();
