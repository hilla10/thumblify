import { Router } from 'express';
import {
  getUsersThumbnail,
  getThumbnailById,
} from '../controllers/userController.js';
import protect from '../middlewares/auth.js';

const userRouter = Router();

userRouter.get('/thumbnails', protect, getUsersThumbnail);
userRouter.get('/thumbnail/:id', protect, getThumbnailById);

export default userRouter;
