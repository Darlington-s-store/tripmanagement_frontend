-- Update Hotels table with more fields
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS region VARCHAR(100);
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS images JSONB;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add amenities to hotel_rooms if needed, or just keep it simple
ALTER TABLE hotel_rooms ADD COLUMN IF NOT EXISTS amenities TEXT;
ALTER TABLE hotel_rooms ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE hotel_rooms ADD COLUMN IF NOT EXISTS images JSONB;

-- Seed some high-quality hotels if possible
INSERT INTO hotels (id, name, location, region, description, price_per_night, amenities, rating, total_rooms, available_rooms, image_url, images, latitude, longitude)
VALUES 
(gen_random_uuid(), 'Labadi Beach Hotel', 'Accra', 'Greater Accra', 'The Labadi Beach Hotel is a 5-star hotel in Accra, Ghana. It is located on Labadi Beach and features upscale accommodations, a private beach, and world-class dining.', 1200.00, 'WiFi, Swimming Pool, Spa, Gym, Restaurant, Beach Access', 4.8, 164, 50, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', '["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"]', 5.5600, -0.1400)
ON CONFLICT DO NOTHING;

INSERT INTO hotels (id, name, location, region, description, price_per_night, amenities, rating, total_rooms, available_rooms, image_url, images, latitude, longitude)
VALUES 
(gen_random_uuid(), 'Kempinski Hotel Gold Coast City', 'Ministries, Accra', 'Greater Accra', 'Kempinski Hotel Gold Coast City Accra is the only 5-star luxury hotel in the city, offering the largest rooms in Accra and a perfect blend of European luxury and African hospitality.', 2500.00, 'WiFi, Swimming Pool, Luxury Spa, Fine Dining, Conference Center', 4.9, 269, 120, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', '["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800", "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"]', 5.5539, -0.1983)
ON CONFLICT DO NOTHING;
