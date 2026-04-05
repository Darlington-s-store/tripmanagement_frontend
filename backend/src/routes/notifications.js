import express from 'express';
import {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getAllNotifications,
    sendAnnouncement,
    deleteNotification
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getUserNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

// Admin notification management
router.get('/admin', getAllNotifications);
router.post('/admin/announcement', sendAnnouncement);
router.delete('/admin/:id', deleteNotification);

export default router;
