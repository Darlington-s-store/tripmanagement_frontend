import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate, registerValidator, resetPasswordValidator } from '../middleware/validators.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/profiles'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
  }
});

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

router.post('/verify-mfa', (req, res, next) => {
  authController.verifyMFA(req, res).catch(next);
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

router.post('/upload-avatar', authenticateToken, upload.single('avatar'), (req, res, next) => {
  authController.uploadAvatar(req, res).catch(next);
});

router.put('/change-password', authenticateToken, (req, res, next) => {
  authController.changePassword(req, res).catch(next);
});

router.put('/preferences', authenticateToken, (req, res, next) => {
  authController.updatePreferences(req, res).catch(next);
});

router.put('/toggle-mfa', authenticateToken, (req, res, next) => {
  authController.toggleMFA(req, res).catch(next);
});

export default router;
