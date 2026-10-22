import { Router } from 'express';
import {
  registerUser,
  loginUser,
  verifyUser,
  logoutUser,
} from '../controllers/authController.js';
import protect from '../middlewares/auth.js';

const authRouter = Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/logout', protect, logoutUser);
authRouter.get('/verify', protect, verifyUser);

export default authRouter;
