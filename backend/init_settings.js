import 'dotenv/config';
import pool from './src/config/database.js';

async function checkSettings() {
    try {
        console.log('Synchronizing settings...');
        const defaults = [
            { key: 'platform_name', value: 'Trip Management Ghana', category: 'general' },
            { key: 'support_email', value: 'support@tripmanagement.com', category: 'general' },
            { key: 'contact_number', value: '+233 24 000 0000', category: 'general' },
            { key: 'allow_user_registration', value: 'true', category: 'general' },
            { key: 'platform_fee', value: '5', category: 'general' },
            { key: 'currency_code', value: 'GHS', category: 'payment' },
            { key: 'paystack_enabled', value: 'true', category: 'payment' },
            { key: 'momo_mtn_enabled', value: 'true', category: 'payment' },
            { key: 'momo_vodafone_enabled', value: 'false', category: 'payment' },
            { key: 'momo_airteltigo_enabled', value: 'false', category: 'payment' },
            { key: 'email_notifications_enabled', value: 'true', category: 'notifications' },
            { key: 'listing_approval_alerts', value: 'true', category: 'notifications' },
            { key: 'sms_notifications_enabled', value: 'false', category: 'notifications' },
            { key: 'admin_approval_required', value: 'false', category: 'security' }
        ];

        let addedCount = 0;
        for (const s of defaults) {
            const check = await pool.query('SELECT key FROM platform_settings WHERE key = $1', [s.key]);
            if (check.rowCount === 0) {
                await pool.query(
                    'INSERT INTO platform_settings (key, value, category) VALUES ($1, $2, $3)',
                    [s.key, s.value, s.category]
                );
                console.log(`Added missing setting: ${s.key}`);
                addedCount++;
            }
        }
        console.log(`Synchronization complete. Added ${addedCount} new settings.`);
    } catch (err) {
        console.error('Error checking settings:', err);
    } finally {
        await pool.end();
    }
}

checkSettings();
