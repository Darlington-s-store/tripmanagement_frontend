import pool from '../config/database.js';

/**
 * Log an administrative action with enhanced metadata
 * @param {Object} req - The request object to extract IP and user agent
 * @param {string} action - Description of the action (e.g., 'DELETE_USER')
 * @param {Object} data - Metadata for the log
 * @param {string} data.resourceType - The feature/table being modified
 * @param {string} data.resourceId - The ID of the primary resource affected
 * @param {Object|string} data.details - Additional context
 */
export async function logAdminAction(req, action, { resourceType, resourceId, details } = {}) {
    if (!req.user) return; // Only log if admin is authenticated

    const client = await pool.connect();
    try {
        const adminId = req.user.id;
        const ipAddress = req.ip || req.headers['x-forwarded-for'];
        const userAgent = req.headers['user-agent'];
        const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;

        await client.query(
            'INSERT INTO admin_logs (admin_id, action, details, ip_address, user_agent, resource_type, resource_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [adminId, action, detailsStr || null, ipAddress || null, userAgent || null, resourceType || null, resourceId || null]
        );
    } catch (error) {
        console.error('Failed to log admin action:', error);
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
