import express from 'express';
import authController from '../controllers/auth.controller.js';
import AuthGuard from '../middlewares/auth-guard.middleware.js';
const router = express.Router()

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verification/:email', authController.verifyEmail);
router.put('/change-password', AuthGuard, authController.changePassword);

export default router;