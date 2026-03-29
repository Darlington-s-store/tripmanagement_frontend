-- Rename read column to is_read and add title column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='read') THEN
        ALTER TABLE notifications RENAME COLUMN read TO is_read;
    END IF;
END $$;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title VARCHAR(255);
