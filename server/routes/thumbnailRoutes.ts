import { Router } from 'express';
import {
  generateThumbnail,
  deleteThumbnail,
} from '../controllers/thumbnailController.js';
import protect from '../middlewares/auth.js';

const thumbnailRouter = Router();

thumbnailRouter.post('/generate', protect, generateThumbnail);
thumbnailRouter.delete('/delete:id', protect, deleteThumbnail);

export default thumbnailRouter;
