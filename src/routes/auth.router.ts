import express from 'express';
import authController from '../controllers/auth.controller.js';
const router = express.Router()

// middleware that is specific to this router
router.use((req, res, next) => {
  // console.log('Time: ', Date.now())
  next()
});

router.post('/register', authController.register);

export default router;