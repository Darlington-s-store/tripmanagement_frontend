require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const destinations = [
  // Historical & Cultural Sites
  { name: 'Cape Coast Castle', region: 'Central', category: 'historical', description: "A UNESCO World Heritage Site and powerful monument to the transatlantic slave trade. One of the most important historical landmarks in West Africa.", image_url: '/placeholder-destination.jpg', entrance_fee: 50, opening_hours: '8am - 5pm', rating: 4.9, review_count: 1204, tags: ['UNESCO','History','Guided Tours'] },
  { name: 'Elmina Castle', region: 'Central', category: 'historical', description: "The oldest European building in sub-Saharan Africa, built by the Portuguese in 1482. A profound and moving historical landmark on the coast.", image_url: '/placeholder-destination.jpg', entrance_fee: 40, opening_hours: '9am - 5pm', rating: 4.8, review_count: 987, tags: ['UNESCO','Colonial','History'] },
  { name: 'Kwame Nkrumah Memorial Park', region: 'Greater Accra', category: 'historical', description: "The mausoleum and memorial of Ghana's first president and founding father. A place of national pride and reflection in the heart of Accra.", image_url: '/placeholder-destination.jpg', entrance_fee: 20, opening_hours: '9am - 5pm', rating: 4.6, review_count: 743, tags: ['History','Architecture','Museum'] },
  { name: 'Manhyia Palace Museum', region: 'Ashanti', category: 'cultural', description: "The official residence of the Asantehene, home to centuries of Ashanti royal history and priceless artifacts from the Ashanti Kingdom.", image_url: '/placeholder-destination.jpg', entrance_fee: 30, opening_hours: '9am - 5pm', rating: 4.7, review_count: 512, tags: ['Royalty','Ashanti','Museum'] },
  { name: 'Larabanga Mosque', region: 'Northern', category: 'historical', description: "One of the oldest mosques in West Africa, built in the ancient Sudanese architectural style. A sacred and historically significant site.", image_url: '/placeholder-destination.jpg', entrance_fee: 10, opening_hours: '8am - 6pm', rating: 4.5, review_count: 289, tags: ['Mosque','Architecture','Sacred'] },
  { name: 'Fort Christiansborg', region: 'Greater Accra', category: 'historical', description: "Also known as Osu Castle, this former colonial fort has served as a seat of government for Ghana since independence.", image_url: '/placeholder-destination.jpg', entrance_fee: 30, opening_hours: '9am - 3pm', rating: 4.4, review_count: 421, tags: ['Colonial','History','Fort'] },
  { name: 'Fort Amsterdam', region: 'Central', category: 'historical', description: "A restored 17th-century Dutch fort near Abandze with panoramic views of the Atlantic coast and important slave trade history.", image_url: '/placeholder-destination.jpg', entrance_fee: 25, opening_hours: '9am - 5pm', rating: 4.3, review_count: 187, tags: ['Fort','Dutch','Colonial'] },
  { name: 'Fort Metal Cross', region: 'Western', category: 'historical', description: "A small but significant Dutch fort in Dixcove, perched on a rocky headland overlooking the Atlantic ocean.", image_url: '/placeholder-destination.jpg', entrance_fee: 20, opening_hours: '9am - 5pm', rating: 4.2, review_count: 143, tags: ['Fort','Colonial','Coastal'] },
  // National Parks & Nature
  { name: 'Kakum National Park', region: 'Central', category: 'nature', description: "Famous for its canopy walkway suspended 30m above the forest floor, offering a thrilling walk through the rainforest alongside exotic birdlife.", image_url: '/placeholder-destination.jpg', entrance_fee: 80, opening_hours: '7am - 6pm', rating: 4.7, review_count: 876, tags: ['Canopy Walk','Wildlife','Nature'] },
  { name: 'Mole National Park', region: 'Northern', category: 'nature', description: "Ghana's largest wildlife refuge, home to elephants, antelopes, warthogs, baboons, and over 300 species of birds. A true African safari experience.", image_url: '/placeholder-destination.jpg', entrance_fee: 100, opening_hours: '6am - 6pm', rating: 4.6, review_count: 654, tags: ['Safari','Elephants','Wildlife'] },
  { name: 'Bia National Park', region: 'Western', category: 'nature', description: "A lush biosphere reserve and UNESCO site sheltering rare forest elephants, chimpanzees, and Diana monkeys in dense tropical forest.", image_url: '/placeholder-destination.jpg', entrance_fee: 60, opening_hours: '6am - 6pm', rating: 4.4, review_count: 198, tags: ['UNESCO','Wildlife','Forest'] },
  { name: 'Digya National Park', region: 'Brong-Ahafo', category: 'nature', description: "A remote national park on the shores of Lake Volta, rich in hippos, crocodiles, African buffaloes, and diverse birdlife.", image_url: '/placeholder-destination.jpg', entrance_fee: 50, opening_hours: '6am - 6pm', rating: 4.3, review_count: 134, tags: ['Hippos','Wildlife','Remote'] },
  { name: 'Shai Hills Resource Reserve', region: 'Greater Accra', category: 'nature', description: "Just outside Accra, this reserve offers caves, baboons, antelopes and excellent bird watching — a perfect day trip from the city.", image_url: '/placeholder-destination.jpg', entrance_fee: 40, opening_hours: '7am - 5pm', rating: 4.4, review_count: 312, tags: ['Day Trip','Caves','Baboons'] },
  { name: 'Ankasa Conservation Area', region: 'Western', category: 'nature', description: "One of Ghana's most biodiverse forests, home to forest elephants, chimpanzees, and rare plant species in the far southwest.", image_url: '/placeholder-destination.jpg', entrance_fee: 50, opening_hours: '6am - 6pm', rating: 4.5, review_count: 167, tags: ['Biodiversity','Forest','Conservation'] },
  // Waterfalls & Mountains
  { name: 'Wli Waterfalls', region: 'Volta', category: 'waterfall', description: "The highest waterfall in West Africa, tucked inside the Agumatsa Wildlife Sanctuary. The hike through the valley is as rewarding as the falls themselves.", image_url: '/placeholder-destination.jpg', entrance_fee: 30, opening_hours: '7am - 5pm', rating: 4.8, review_count: 921, tags: ['Waterfall','Hiking','Volta'] },
  { name: 'Boti Falls', region: 'Eastern', category: 'waterfall', description: "Twin waterfalls that merge during the rainy season into a stunning single cascade, set deep in the Eastern Region forest.", image_url: '/placeholder-destination.jpg', entrance_fee: 25, opening_hours: '7am - 5pm', rating: 4.5, review_count: 445, tags: ['Twin Falls','Nature','Picnic'] },
  { name: 'Tagbo Falls', region: 'Volta', category: 'waterfall', description: "A beautiful multi-tiered waterfall near Liati Wote village, reached by a scenic hike through a coffee plantation.", image_url: '/placeholder-destination.jpg', entrance_fee: 20, opening_hours: '7am - 5pm', rating: 4.6, review_count: 289, tags: ['Hiking','Volta','Nature'] },
  { name: 'Kintampo Waterfalls', region: 'Brong-Ahafo', category: 'waterfall', description: "One of Ghana's most visited waterfalls, located near the geographic centre of the country with easy access and a refreshing swimming pool.", image_url: '/placeholder-destination.jpg', entrance_fee: 20, opening_hours: '8am - 5pm', rating: 4.4, review_count: 387, tags: ['Swimming','Accessible','Nature'] },
  { name: 'Mount Afadja', region: 'Volta', category: 'waterfall', description: "Ghana's highest mountain at 885m, offering a challenging but rewarding trek with panoramic views across the Volta Region and into Togo.", image_url: '/placeholder-destination.jpg', entrance_fee: 35, opening_hours: '7am - 4pm', rating: 4.7, review_count: 534, tags: ['Trekking','Mountain','Views'] },
  { name: 'Mount Gemi', region: 'Volta', category: 'waterfall', description: "A smaller but rewarding mountain near Tafi Atome with a large cross at the summit offering stunning views across the surrounding plains.", image_url: '/placeholder-destination.jpg', entrance_fee: 15, opening_hours: '7am - 5pm', rating: 4.3, review_count: 178, tags: ['Mountain','Views','Religious'] },
  // Lakes & Rivers
  { name: 'Lake Bosomtwe', region: 'Ashanti', category: 'lake', description: "Ghana's only natural lake, formed by a meteorite impact thousands of years ago. Sacred to the Ashanti people and perfect for swimming and boat trips.", image_url: '/placeholder-destination.jpg', entrance_fee: 10, opening_hours: 'All Day', rating: 4.6, review_count: 612, tags: ['Sacred Lake','Boating','Swimming'] },
  { name: 'Volta Lake', region: 'Eastern', category: 'lake', description: "One of the world's largest man-made lakes, created by the Akosombo Dam. Enjoy boat cruises, fishing, and island village visits.", image_url: '/placeholder-destination.jpg', entrance_fee: 5, opening_hours: 'All Day', rating: 4.4, review_count: 421, tags: ['Boat Cruise','Fishing','Islands'] },
  { name: 'Pra River', region: 'Central', category: 'lake', description: "A scenic river ideal for canoe rides, fishing, and relaxed riverside picnics through the forests of Central and Western Ghana.", image_url: '/placeholder-destination.jpg', entrance_fee: 0, opening_hours: 'All Day', rating: 4.2, review_count: 145, tags: ['Canoeing','Fishing','Peaceful'] },
  { name: 'Ankobra River', region: 'Western', category: 'lake', description: "A winding river through Western Ghana's dense forest belt, popular for ecotourism boat trips and birdwatching in a pristine environment.", image_url: '/placeholder-destination.jpg', entrance_fee: 0, opening_hours: 'All Day', rating: 4.3, review_count: 112, tags: ['Birdwatching','Ecotourism','River'] },
  // Beaches
  { name: 'Labadi Beach', region: 'Greater Accra', category: 'beach', description: "Accra's most popular beach with food stalls, live drumming, horse rides, and a vibrant weekend atmosphere that captures the spirit of the city.", image_url: '/placeholder-destination.jpg', entrance_fee: 10, opening_hours: 'All Day', rating: 4.3, review_count: 2341, tags: ['Swimming','Nightlife','Food'] },
  { name: 'Kokrobite Beach', region: 'Greater Accra', category: 'beach', description: "A relaxed beach village west of Accra known for its reggae vibes, local seafood, and popular drum and dance academy.", image_url: '/placeholder-destination.jpg', entrance_fee: 0, opening_hours: 'All Day', rating: 4.5, review_count: 876, tags: ['Reggae','Relaxed','Seafood'] },
  { name: 'Busua Beach', region: 'Western', category: 'beach', description: "One of Ghana's finest beaches with calm waves ideal for swimming and surfing, plus a laid-back village atmosphere and fresh fish restaurants.", image_url: '/placeholder-destination.jpg', entrance_fee: 0, opening_hours: 'All Day', rating: 4.6, review_count: 543, tags: ['Surfing','Peaceful','Village'] },
  { name: 'Ada Foah Beach', region: 'Greater Accra', category: 'beach', description: "Where the Volta River meets the Atlantic Ocean. Known for luxury beach resorts, kayaking, and stunning sandbar views.", image_url: '/placeholder-destination.jpg', entrance_fee: 0, opening_hours: 'All Day', rating: 4.7, review_count: 712, tags: ['Luxury','Kayaking','Sandbar'] },
  { name: 'Bojo Beach', region: 'Greater Accra', category: 'beach', description: "A private island beach near Accra accessible by canoe, offering a clean and calm escape from the city with beach BBQ and watersports.", image_url: '/placeholder-destination.jpg', entrance_fee: 15, opening_hours: '8am - 6pm', rating: 4.4, review_count: 489, tags: ['Island','Private','Watersports'] },
  { name: 'Anomabo Beach', region: 'Central', category: 'beach', description: "A quiet fishing village beach with an old fort, fresh fish markets, and an authentic taste of Ghanaian coastal life away from tourist crowds.", image_url: '/placeholder-destination.jpg', entrance_fee: 0, opening_hours: 'All Day', rating: 4.3, review_count: 234, tags: ['Fishing Village','Heritage','Quiet'] },
  // Unique Attractions
  { name: 'Nzulezu Stilt Village', region: 'Western', category: 'unique', description: "An entire community built on stilts over Lake Tadane. Accessible only by canoe, this UNESCO-listed village is unlike anything else in Ghana.", image_url: '/placeholder-destination.jpg', entrance_fee: 40, opening_hours: '7am - 5pm', rating: 4.8, review_count: 398, tags: ['UNESCO','Canoe','Village'] },
  { name: 'Aburi Botanical Gardens', region: 'Eastern', category: 'unique', description: "A peaceful hilltop garden dating back to 1890, with towering trees, exotic plants, monkeys, and cool mountain air just 35km from Accra.", image_url: '/placeholder-destination.jpg', entrance_fee: 15, opening_hours: '8am - 6pm', rating: 4.5, review_count: 623, tags: ['Gardens','Nature','Peaceful'] },
  { name: 'Tafi Atome Monkey Sanctuary', region: 'Volta', category: 'unique', description: "A sacred community-managed forest home to Mona monkeys that feed from your hand. A unique wildlife experience with a cultural edge.", image_url: '/placeholder-destination.jpg', entrance_fee: 25, opening_hours: '7am - 5pm', rating: 4.6, review_count: 312, tags: ['Monkeys','Wildlife','Sacred'] },
  { name: 'Boabeng-Fiema Monkey Sanctuary', region: 'Brong-Ahafo', category: 'unique', description: "Two villages protecting Colobus and Mona monkeys for generations as sacred animals. The monkeys roam freely through the villages.", image_url: '/placeholder-destination.jpg', entrance_fee: 20, opening_hours: '7am - 5pm', rating: 4.5, review_count: 267, tags: ['Sacred Monkeys','Community','Nature'] },
  { name: 'Paga Crocodile Pond', region: 'Upper East', category: 'unique', description: "Sacred crocodiles that allow humans to sit on them, believed to be the souls of departed villagers. One of Africa's most unusual wildlife encounters.", image_url: '/placeholder-destination.jpg', entrance_fee: 20, opening_hours: '8am - 5pm', rating: 4.7, review_count: 521, tags: ['Crocodiles','Sacred','Upper East'] },
  { name: 'Umbrella Rock', region: 'Eastern', category: 'unique', description: "A naturally balanced rock formation that resembles an open umbrella. A short hike from the road with great village views.", image_url: '/placeholder-destination.jpg', entrance_fee: 10, opening_hours: 'All Day', rating: 4.4, review_count: 198, tags: ['Rock Formation','Hiking','Views'] },
  { name: 'Akaa Falls', region: 'Volta', category: 'waterfall', description: "A hidden gem waterfall near Hohoe surrounded by dense forest, known for its swimming holes and peaceful, crowd-free atmosphere.", image_url: '/placeholder-destination.jpg', entrance_fee: 15, opening_hours: '7am - 5pm', rating: 4.5, review_count: 143, tags: ['Hidden Gem','Swimming','Peaceful'] },
  { name: 'Asenema Waterfall', region: 'Western', category: 'waterfall', description: "A stunning waterfall in the Western Region rainforest, less visited than most — ideal for travellers wanting a quiet wilderness experience.", image_url: '/placeholder-destination.jpg', entrance_fee: 10, opening_hours: '7am - 5pm', rating: 4.4, review_count: 98, tags: ['Off the Beaten Path','Nature','Waterfall'] },
  { name: 'Tano Sacred Grove', region: 'Brong-Ahafo', category: 'unique', description: "An ancient forest sacred to the Brong people, home to the Tano River deity. A spiritually significant and botanically rich site.", image_url: '/placeholder-destination.jpg', entrance_fee: 15, opening_hours: '8am - 5pm', rating: 4.3, review_count: 132, tags: ['Sacred','Forest','Cultural'] },
  { name: 'Okomfo Anokye Sword Site', region: 'Ashanti', category: 'unique', description: "The legendary sword the great priest Okomfo Anokye thrust into the ground — said to be impossible to remove. A legendary Ashanti symbol of unity.", image_url: '/placeholder-destination.jpg', entrance_fee: 10, opening_hours: '8am - 5pm', rating: 4.4, review_count: 387, tags: ['Legend','Ashanti','History'] },
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🔗 Connected to database...');

    // Recreate attractions table
    await client.query(`DROP TABLE IF EXISTS attractions CASCADE`);
    await client.query(`
      CREATE TABLE attractions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        region VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        image_url TEXT,
        entrance_fee DECIMAL(10,2) DEFAULT 0,
        opening_hours VARCHAR(100),
        rating DECIMAL(3,2) DEFAULT 0.0,
        review_count INT DEFAULT 0,
        tags TEXT[],
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table ready');

    // Clear existing data then re-insert fresh
    await client.query(`DELETE FROM attractions`);
    console.log('🧹 Cleared existing attractions');

    let inserted = 0;
    for (const d of destinations) {
      await client.query(
        `INSERT INTO attractions (name, region, category, description, image_url, entrance_fee, opening_hours, rating, review_count, tags, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'active')`,
        [d.name, d.region, d.category, d.description, d.image_url, d.entrance_fee, d.opening_hours, d.rating, d.review_count, d.tags]
      );
      inserted++;
      process.stdout.write(`\r📍 Inserted ${inserted}/${destinations.length}: ${d.name}                    `);
    }

    console.log(`\n\n✅ Done! ${inserted} destinations seeded successfully.`);

    // Verify
    const result = await client.query('SELECT category, COUNT(*) as count FROM attractions GROUP BY category ORDER BY count DESC');
    console.log('\n📊 Breakdown by category:');
    result.rows.forEach(r => console.log(`   ${r.category.padEnd(12)} → ${r.count} destinations`));

  } catch (err) {
    console.error('\n❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
