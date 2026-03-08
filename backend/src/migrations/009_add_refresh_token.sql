-- Add refresh_token to users table safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='refresh_token') THEN
        ALTER TABLE users ADD COLUMN refresh_token TEXT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_refresh_token ON users(refresh_token);
