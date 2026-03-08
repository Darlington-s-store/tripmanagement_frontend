import express from 'express';
import * as transportController from '../controllers/transportController.js';

const router = express.Router();

router.get('/', transportController.getTransportServices);
router.get('/:id', transportController.getTransportById);

export default router;
