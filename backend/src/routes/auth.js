import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate, registerValidator, resetPasswordValidator } from '../middleware/validators.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerValidator), (req, res, next) => {
  authController.register(req, res).catch(next);
});

router.post('/login', (req, res, next) => {
  authController.login(req, res).catch(next);
});

router.post('/admin-login', (req, res, next) => {
  authController.adminLogin(req, res).catch(next);
});

router.post('/forgot-password', (req, res, next) => {
  authController.forgotPassword(req, res).catch(next);
});

router.post('/reset-password', validate(resetPasswordValidator), (req, res, next) => {
  authController.resetPassword(req, res).catch(next);
});

router.post('/refresh-token', (req, res, next) => {
  authController.refreshToken(req, res).catch(next);
});

// Protected routes
router.post('/logout', authenticateToken, (req, res, next) => {
  authController.logout(req, res).catch(next);
});

router.get('/profile', authenticateToken, (req, res, next) => {
  authController.getProfile(req, res).catch(next);
});

router.put('/profile', authenticateToken, (req, res, next) => {
  authController.updateProfile(req, res).catch(next);
});

router.put('/change-password', authenticateToken, (req, res, next) => {
  authController.changePassword(req, res).catch(next);
});

router.put('/preferences', authenticateToken, (req, res, next) => {
  authController.updatePreferences(req, res).catch(next);
});

export default router;
