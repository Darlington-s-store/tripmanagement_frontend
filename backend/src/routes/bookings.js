import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, (req, res, next) => {
  bookingController.createBooking(req, res).catch(next);
});

router.get('/', authenticateToken, (req, res, next) => {
  bookingController.getUserBookings(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
  bookingController.getBookingById(req, res).catch(next);
});

router.put('/:id', authenticateToken, (req, res, next) => {
  bookingController.updateBooking(req, res).catch(next);
});

router.put('/:id/status', authenticateToken, (req, res, next) => {
  bookingController.updateBooking(req, res).catch(next);
});

router.put('/:id/cancel', authenticateToken, (req, res, next) => {
  bookingController.cancelBooking(req, res).catch(next);
});

router.delete('/:id', authenticateToken, (req, res, next) => {
  bookingController.cancelBooking(req, res).catch(next);
});

export default router;
