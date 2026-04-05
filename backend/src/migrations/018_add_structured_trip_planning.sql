-- =========================================================
-- Migration 018: Add structured trip planning fields
-- =========================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trips' AND column_name = 'trip_name'
    ) THEN
        ALTER TABLE trips ADD COLUMN trip_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trips' AND column_name = 'traveller_count'
    ) THEN
        ALTER TABLE trips ADD COLUMN traveller_count INT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trips' AND column_name = 'planning_details'
    ) THEN
        ALTER TABLE trips ADD COLUMN planning_details JSONB;
    END IF;
END $$;

UPDATE trips
SET traveller_count = 1
WHERE traveller_count IS NULL;

ALTER TABLE trips
ALTER COLUMN traveller_count SET DEFAULT 1;

ALTER TABLE trips
ALTER COLUMN traveller_count SET NOT NULL;

ALTER TABLE trips
DROP CONSTRAINT IF EXISTS trips_traveller_count_check;

ALTER TABLE trips
ADD CONSTRAINT trips_traveller_count_check CHECK (traveller_count > 0);

UPDATE trips
SET planning_details = '{}'::jsonb
WHERE planning_details IS NULL;

ALTER TABLE trips
ALTER COLUMN planning_details SET DEFAULT '{}'::jsonb;

ALTER TABLE trips
ALTER COLUMN planning_details SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_trips_trip_name ON trips(trip_name);
CREATE INDEX IF NOT EXISTS idx_trips_planning_details ON trips USING GIN (planning_details);
