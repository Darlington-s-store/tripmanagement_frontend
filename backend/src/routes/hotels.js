import express from 'express';
import * as hotelController from '../controllers/hotelController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res, next) => {
  hotelController.getAllHotels(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
  hotelController.getHotelById(req, res).catch(next);
});

router.post('/', authenticateToken, authorizeRole(['admin']), (req, res, next) => {
  hotelController.createHotel(req, res).catch(next);
});

router.put('/:id', authenticateToken, authorizeRole(['admin']), (req, res, next) => {
  hotelController.updateHotel(req, res).catch(next);
});

router.delete('/:id', authenticateToken, authorizeRole(['admin']), (req, res, next) => {
  hotelController.deleteHotel(req, res).catch(next);
});

// Room routes
router.post('/rooms', authenticateToken, authorizeRole(['admin', 'provider']), (req, res, next) => {
  hotelController.createHotelRoom(req, res).catch(next);
});

router.put('/rooms/:id', authenticateToken, authorizeRole(['admin', 'provider']), (req, res, next) => {
  hotelController.updateHotelRoom(req, res).catch(next);
});

router.delete('/rooms/:id', authenticateToken, authorizeRole(['admin', 'provider']), (req, res, next) => {
  hotelController.deleteHotelRoom(req, res).catch(next);
});

export default router;
