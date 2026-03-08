-- Add room_id to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES hotel_rooms(id) ON DELETE SET NULL;

-- Update the booking check to allow hotel bookings with room_id
-- (No change needed to the CHECK constraint as it already allows 'hotel')
