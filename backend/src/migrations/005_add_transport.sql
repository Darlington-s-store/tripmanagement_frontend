-- Add transport to booking_type check constraint
-- Note: In Postgres, you can't easily modify a check constraint. You have to drop and recreate it.
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_booking_type_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_booking_type_check CHECK (booking_type IN ('hotel', 'guide', 'activity', 'transport'));

-- Create transport_services table
CREATE TABLE IF NOT EXISTS transport_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'bus', 'flight', 'car'
  operator VARCHAR(100) NOT NULL,
  from_location VARCHAR(100) NOT NULL,
  to_location VARCHAR(100) NOT NULL,
  departure_time VARCHAR(50),
  arrival_time VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL,
  capacity INT,
  image_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed some transport data
INSERT INTO transport_services (id, name, type, operator, from_location, to_location, departure_time, arrival_time, price, capacity)
VALUES 
('b1111111-1111-1111-1111-111111111111', 'Bus to Kumasi', 'bus', 'VIP Jeoun', 'Accra', 'Kumasi', '6:00 AM', '11:00 AM', 120, 45),
('b2222222-2222-2222-2222-222222222222', 'Bus to Cape Coast', 'bus', 'STC', 'Accra', 'Cape Coast', '7:30 AM', '10:00 AM', 80, 50),
('f1111111-1111-1111-1111-111111111111', 'Flight to Tamale', 'flight', 'Africa World Airlines', 'Accra', 'Tamale', '8:00 AM', '9:15 AM', 650, 50)
ON CONFLICT (id) DO NOTHING;
