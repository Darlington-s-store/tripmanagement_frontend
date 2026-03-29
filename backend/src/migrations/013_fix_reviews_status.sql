-- Add status column to reviews table for moderation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='status') THEN
        ALTER TABLE reviews ADD COLUMN status VARCHAR(50) DEFAULT 'published';
    END IF;
END $$;

-- Update existing reviews to have 'published' status
UPDATE reviews SET status = 'published' WHERE status IS NULL;
