-- Trip Categories
CREATE TABLE IF NOT EXISTS trip_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Destinations
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  region VARCHAR(100) NOT NULL,
  category_id UUID REFERENCES trip_categories(id) ON DELETE SET NULL,
  description TEXT,
  image_url VARCHAR(500),
  entrance_fee VARCHAR(100),
  opening_hours VARCHAR(100),
  rating DECIMAL(3, 2) DEFAULT 0.0,
  reviews_count INT DEFAULT 0,
  location_data JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'draft')),
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tourist Attractions (specifically within destinations)
CREATE TABLE IF NOT EXISTS attractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  image_url VARCHAR(500),
  entrance_fee VARCHAR(100),
  opening_hours VARCHAR(100),
  location_data JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'draft')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suggested Itineraries (Templates)
CREATE TABLE IF NOT EXISTS suggested_itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_days INT NOT NULL,
  image_url VARCHAR(500),
  difficulty VARCHAR(50) DEFAULT 'easy',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suggested Itinerary Activities
CREATE TABLE IF NOT EXISTS suggested_itinerary_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES suggested_itineraries(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  time_slot VARCHAR(50), -- 'morning', 'afternoon', 'evening'
  activity_name VARCHAR(255) NOT NULL,
  activity_type VARCHAR(50), -- 'attraction', 'hotel', 'transport', 'food', 'other'
  description TEXT,
  attraction_id UUID REFERENCES attractions(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Categories
INSERT INTO trip_categories (name, description, icon) VALUES
('Adventure', 'Thrill-seeking and outdoor activities', 'Tent'),
('Cultural', 'Experience local traditions and art', 'Landmark'),
('Beach', 'Relaxing seaside vacations', 'Waves'),
('Wildlife', 'Safari and animal encounters', 'Elephant'),
('Historical', 'Visit ancient landmarks and museums', 'Museum')
ON CONFLICT (name) DO NOTHING;
