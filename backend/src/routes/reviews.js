import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, (req, res, next) => {
  reviewController.createReview(req, res).catch(next);
});

router.get('/', authenticateToken, (req, res, next) => {
  reviewController.getUserReviews(req, res).catch(next);
});

router.get('/booking/:bookingId', (req, res, next) => {
  reviewController.getBookingReviews(req, res).catch(next);
});

router.put('/:id', authenticateToken, (req, res, next) => {
  reviewController.updateReview(req, res).catch(next);
});

router.delete('/:id', authenticateToken, (req, res, next) => {
  reviewController.deleteReview(req, res).catch(next);
});

export default router;
