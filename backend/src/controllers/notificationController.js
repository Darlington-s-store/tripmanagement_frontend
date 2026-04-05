import pool from '../config/database.js';
import { sendEmail } from '../utils/email.js';
import { UnauthorizedError, NotFoundError, ValidationError, ForbiddenError } from '../utils/errors.js';

export const getUserNotifications = async (req, res) => {
    const userId = req.user.id;

    const result = await pool.query(
        'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
        [userId]
    );

    res.json({ success: true, data: result.rows });
};

export const markAsRead = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
        'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
        [id, userId]
    );

    res.json({ success: true, message: 'Notification marked as read' });
};

export const markAllAsRead = async (req, res) => {
    const userId = req.user.id;

    await pool.query(
        'UPDATE notifications SET is_read = true WHERE user_id = $1',
        [userId]
    );

    res.json({ success: true, message: 'All notifications marked as read' });
};

export const createNotification = async (userId, type, title, message) => {
    try {
        const result = await pool.query(
            'INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4) RETURNING id',
            [userId, type, title, message]
        );
        return result.rows[0].id;
    } catch (error) {
        console.error('Create notification error:', error);
    }
};

/**
 * Notify all administrators and optionally send emails for critical events
 * @param {string} type - Notification type
 * @param {string} title - Main heading
 * @param {string} message - Content
 * @param {boolean} [sendEmailToAdmins=true] - Whether to also send emails
 */
export const notifyAdmins = async (type, title, message, sendEmailToAdmins = true) => {
    try {
        const admins = await pool.query('SELECT id, email, full_name FROM users WHERE role = $1', ['admin']);
        
        for (const admin of admins.rows) {
            // Create In-App Notification
            await createNotification(admin.id, type, title, message);

            // Send Email Alert for critical events
            const criticalTypes = ['new_booking', 'user_registration', 'new_review', 'dispute_opened'];
            if (sendEmailToAdmins && criticalTypes.includes(type)) {
                try {
                    await sendEmail({
                        email: admin.email,
                        subject: `[TripEase Admin] ${title}`,
                        message: `Hello ${admin.full_name},\n\n${message}\n\nPlease check the admin dashboard for details.\n\nRegards,\nTripEase Ghana System`,
                        html: `
                            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                                <h2 style="color: #2D3FE6;">Admin Alert: ${title}</h2>
                                <p>${message}</p>
                                <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px;">
                                    <strong>Details:</strong><br/>
                                    Type: ${type.replace('_', ' ').toUpperCase()}<br/>
                                    Time: ${new Date().toLocaleString()}
                                </div>
                                <p style="margin-top: 20px;">
                                    <a href="${process.env.CORS_ORIGIN || 'http://localhost:8080'}/admin" style="background-color: #2D3FE6; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">Open Admin Dashboard</a>
                                </p>
                            </div>
                        `
                    });
                } catch (emailErr) {
                    console.error(`Failed to send admin email alert to ${admin.email}:`, emailErr);
                }
            }
        }
    } catch (error) {
        console.error('Notify admins error:', error);
    }
};

export const getAllNotifications = async (req, res) => {
    if (req.user.role !== 'admin') throw new ForbiddenError('Access denied');

    const result = await pool.query(
        `SELECT n.*, u.full_name as user_full_name, u.email as user_email 
         FROM notifications n 
         JOIN users u ON n.user_id = u.id 
         ORDER BY n.created_at DESC LIMIT 100`
    );

    res.json({ success: true, data: result.rows });
};

export const sendAnnouncement = async (req, res) => {
    if (req.user.role !== 'admin') throw new ForbiddenError('Access denied');
    
    const { title, message, type = 'announcement' } = req.body;
    
    if (!title || !message) throw new ValidationError('Title and message are required');
    
    try {
        const result = await pool.query('SELECT id FROM users');
        const users = result.rows;

        for (const user of users) {
            await createNotification(user.id, type, title, message);
        }

        res.json({ 
            success: true, 
            message: `Announcement sent to ${users.length} users successfully.` 
        });
    } catch (error) {
        console.error('Send announcement error:', error);
        throw error;
    }
};

export const deleteNotification = async (req, res) => {
    if (req.user.role !== 'admin') throw new ForbiddenError('Access denied');
    const { id } = req.params;

    await pool.query('DELETE FROM notifications WHERE id = $1', [id]);
    res.json({ success: true, message: 'Notification deleted' });
};
