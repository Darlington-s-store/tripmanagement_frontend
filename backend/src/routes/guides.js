import express from 'express';
import * as guideController from '../controllers/guideController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res, next) => {
  guideController.getAllGuides(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
  guideController.getGuideById(req, res).catch(next);
});

router.post('/', authenticateToken, authorizeRole(['admin']), (req, res, next) => {
  guideController.createGuide(req, res).catch(next);
});

router.put('/:id', authenticateToken, authorizeRole(['admin']), (req, res, next) => {
  guideController.updateGuide(req, res).catch(next);
});

router.delete('/:id', authenticateToken, authorizeRole(['admin']), (req, res, next) => {
  guideController.deleteGuide(req, res).catch(next);
});

export default router;
