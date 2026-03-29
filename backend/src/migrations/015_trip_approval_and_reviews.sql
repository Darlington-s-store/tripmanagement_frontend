-- =========================================================
-- Migration 015: Support trip approval, destination enrichment, and reviews
-- =========================================================

-- 1. Update trips status CHECK constraint to allow new statuses
-- Drop old constraint and add new one with pending/approved/declined
ALTER TABLE trips DROP CONSTRAINT IF EXISTS trips_status_check;
ALTER TABLE trips ADD CONSTRAINT trips_status_check 
  CHECK (status IN ('planning', 'pending', 'approved', 'declined', 'ongoing', 'completed', 'cancelled'));

-- 2. Add is_public and is_featured columns to trips (for admin management)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trips' AND column_name='is_public') THEN
        ALTER TABLE trips ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trips' AND column_name='is_featured') THEN
        ALTER TABLE trips ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trips' AND column_name='admin_notes') THEN
        ALTER TABLE trips ADD COLUMN admin_notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trips' AND column_name='reviewed_by') THEN
        ALTER TABLE trips ADD COLUMN reviewed_by UUID REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trips' AND column_name='reviewed_at') THEN
        ALTER TABLE trips ADD COLUMN reviewed_at TIMESTAMP;
    END IF;
END $$;

-- 3. Enrich attractions table with full_description, travel_tips, gallery, region
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attractions' AND column_name='region') THEN
        ALTER TABLE attractions ADD COLUMN region VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attractions' AND column_name='full_description') THEN
        ALTER TABLE attractions ADD COLUMN full_description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attractions' AND column_name='travel_tips') THEN
        ALTER TABLE attractions ADD COLUMN travel_tips TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attractions' AND column_name='gallery') THEN
        ALTER TABLE attractions ADD COLUMN gallery JSONB DEFAULT '[]';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attractions' AND column_name='rating') THEN
        ALTER TABLE attractions ADD COLUMN rating DECIMAL(3, 2) DEFAULT 0.0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attractions' AND column_name='review_count') THEN
        ALTER TABLE attractions ADD COLUMN review_count INT DEFAULT 0;
    END IF;
END $$;

-- 4. Make reviews.booking_id optional (allow destination/service reviews without a booking)
-- First drop the NOT NULL and FK constraints, then re-add FK without NOT NULL
DO $$
BEGIN
    -- Check if the column is NOT NULL and make it nullable
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='reviews' AND column_name='booking_id' AND is_nullable='NO'
    ) THEN
        ALTER TABLE reviews ALTER COLUMN booking_id DROP NOT NULL;
    END IF;
END $$;

-- 5. Add service_type and service_id to reviews for linking to any service
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='service_type') THEN
        ALTER TABLE reviews ADD COLUMN service_type VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='service_id') THEN
        ALTER TABLE reviews ADD COLUMN service_id UUID;
    END IF;
END $$;

-- 6. Add indexes for better query performance on new fields
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_reviews_service ON reviews(service_type, service_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_attractions_region ON attractions(region);
CREATE INDEX IF NOT EXISTS idx_attractions_category ON attractions(category);
