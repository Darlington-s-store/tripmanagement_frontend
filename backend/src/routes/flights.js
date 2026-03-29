import express from 'express';
import * as flightController from '../controllers/flightController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', flightController.getAllFlights);
router.get('/:id', flightController.getFlightById);

// Admin managed routes
router.post('/', authenticateToken, authorizeRole(['admin']), flightController.createFlight);
router.put('/:id', authenticateToken, authorizeRole(['admin']), flightController.updateFlight);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), flightController.deleteFlight);

export default router;
