-- Settings table for platform-wide configuration
CREATE TABLE IF NOT EXISTS platform_settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    category VARCHAR(100), -- 'general', 'payment', 'notifications', etc.
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial default settings
INSERT INTO platform_settings (key, value, category, description) VALUES
('platform_name', 'Trip Management Ghana', 'general', 'Visible name of the platform across the application'),
('support_email', 'support@tripmanagementghana.com', 'general', 'Contact email for customer support'),
('platform_fee', '5', 'general', 'Percentage fee taken from each booking'),
('momo_mtn_enabled', 'true', 'payment', 'Whether MTN Mobile Money is accepted'),
('momo_vodafone_enabled', 'true', 'payment', 'Whether Vodafone Cash is accepted'),
('momo_airteltigo_enabled', 'true', 'payment', 'Whether AirtelTigo Money is accepted'),
('paystack_enabled', 'true', 'payment', 'Whether Paystack card payments are enabled'),
('email_notifications_enabled', 'true', 'notifications', 'Enable/Disable admin email notifications'),
('sms_notifications_enabled', 'false', 'notifications', 'Enable/Disable admin SMS notifications'),
('listing_approval_alerts', 'true', 'notifications', 'Notify admin when new listings are submitted')
ON CONFLICT (key) DO NOTHING;
