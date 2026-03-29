import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

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
        const id = uuidv4();
        await pool.query(
            'INSERT INTO notifications (id, user_id, type, title, message) VALUES ($1, $2, $3, $4, $5)',
            [id, userId, type, title, message]
        );
        return id;
    } catch (error) {
        console.error('Create notification error:', error);
    }
};

export const notifyAdmins = async (type, title, message) => {
    try {
        const admins = await pool.query('SELECT id FROM users WHERE role = $1', ['admin']);
        for (const admin of admins.rows) {
            await createNotification(admin.id, type, title, message);
        }
    } catch (error) {
        console.error('Notify admins error:', error);
    }
};
