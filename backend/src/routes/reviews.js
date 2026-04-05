import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Publicly accessible route to get 10 most recent published reviews
router.get('/published', (req, res, next) => {
  reviewController.getPublishedReviews(req, res).catch(next);
});

// Submit a review (optional token support for logged-in users tracking)
router.post('/', (req, res, next) => {
  optionalAuthenticateToken(req, res, () => {
    reviewController.createReview(req, res).catch(next);
  });
});

// Private/User-specific reviews (must be authenticated)
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
