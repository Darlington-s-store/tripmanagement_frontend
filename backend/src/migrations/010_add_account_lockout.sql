-- Add account lockout columns safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='failed_login_attempts') THEN
        ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='lock_until') THEN
        ALTER TABLE users ADD COLUMN lock_until TIMESTAMP;
    END IF;
END $$;

-- Add index safely
CREATE INDEX IF NOT EXISTS idx_users_lockout ON users (email, lock_until);
