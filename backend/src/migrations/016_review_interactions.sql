-- Migration 016: Add review interactions (likes and reports)

-- Likes table for user-specific tracking
CREATE TABLE IF NOT EXISTS review_likes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, review_id)
);

-- Reports table for tracking issues
CREATE TABLE IF NOT EXISTS review_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' -- pending, resolved, dismissed
);

-- Add counts to reviews table for quick display
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='likes_count') THEN
        ALTER TABLE reviews ADD COLUMN likes_count INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='reports_count') THEN
        ALTER TABLE reviews ADD COLUMN reports_count INT DEFAULT 0;
    END IF;
END $$;
