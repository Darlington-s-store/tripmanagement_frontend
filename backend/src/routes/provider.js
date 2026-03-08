import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import * as providerController from '../controllers/providerController.js';

const router = express.Router();

// All provider routes require authentication and provider role
router.use(authenticateToken);
router.use(authorizeRole(['provider', 'admin']));

router.get('/dashboard', providerController.getProviderDashboard);
router.get('/listings', providerController.getProviderListings);
router.get('/bookings', providerController.getProviderBookings);

export default router;
