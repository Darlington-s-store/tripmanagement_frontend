import express from 'express';
import * as destinationsController from '../controllers/destinationsController.js';

const router = express.Router();


router.get('/', destinationsController.getDestinations);
router.get('/categories', destinationsController.getCategories);
router.get('/attractions/search', destinationsController.searchAttractions);
router.get('/:id', destinationsController.getDestinationById);

export default router;
