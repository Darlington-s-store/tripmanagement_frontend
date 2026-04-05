import express from 'express';
import * as receiptController from '../controllers/receiptController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all receipts for authenticated user
router.get('/', authenticateToken, (req, res, next) => {
  receiptController.getUserReceipts(req, res).catch(next);
});

// Get specific receipt by ID
router.get('/:id', authenticateToken, (req, res, next) => {
  receiptController.getReceiptById(req, res).catch(next);
});

// Get receipt by booking ID
router.get('/booking/:bookingId', authenticateToken, (req, res, next) => {
  receiptController.getReceiptByBookingId(req, res).catch(next);
});

// Get receipt statistics for user
router.get('/stats/overview', authenticateToken, (req, res, next) => {
  receiptController.getReceiptStats(req, res).catch(next);
});

// Record receipt download
router.post('/:id/download', authenticateToken, (req, res, next) => {
  receiptController.recordReceiptDownload(req, res).catch(next);
});

// Record receipt print
router.post('/:id/print', authenticateToken, (req, res, next) => {
  receiptController.recordReceiptPrint(req, res).catch(next);
});

// Delete receipt
router.delete('/:id', authenticateToken, (req, res, next) => {
  receiptController.deleteReceipt(req, res).catch(next);
});

export default router;
