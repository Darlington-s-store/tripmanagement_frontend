import pool from '../config/database.js';

/**
 * Log an administrative action
 * @param {string} adminId - UUID of the admin
 * @param {string} action - Description of the action (e.g., 'DELETE_USER')
 * @param {Object|string} details - Additional details about the action
 */
export async function logAdminAction(adminId, action, details) {
    const client = await pool.connect();
    try {
        await client.query(
            'INSERT INTO admin_logs (admin_id, action, details) VALUES ($1, $2, $3)',
            [adminId, action, typeof details === 'object' ? JSON.stringify(details) : details]
        );
    } catch (error) {
        console.error('Failed to log admin action:', error);
        // Don't throw error to prevent breaking the main action
    } finally {
        client.release();
    }
}

/**
 * Log a user security event
 * @param {Object} data
 * @param {string} data.userId 
 * @param {string} data.eventType 
 * @param {string} data.ipAddress
 * @param {string} data.userAgent
 * @param {Object} data.details 
 */
export async function logSecurityEvent({ userId, eventType, ipAddress, userAgent, details }) {
    const client = await pool.connect();
    try {
        await client.query(
            'INSERT INTO security_events (user_id, event_type, ip_address, user_agent, details) VALUES ($1, $2, $3, $4, $5)',
            [userId || null, eventType, ipAddress || null, userAgent || null, details ? JSON.stringify(details) : null]
        );
        console.log(`[SECURITY_${eventType.toUpperCase()}] User: ${userId || 'GUEST'} | IP: ${ipAddress}`);
    } catch (error) {
        console.error('Failed to log security event:', error);
    } finally {
        client.release();
    }
}
