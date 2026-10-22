import {Router} from 'express';
import {generateThumbnail, deleteThumbnail} from '../controllers/thumbnailController.js';

const thumbnailRouter = Router();

thumbnailRouter.post('/generate', generateThumbnail);
thumbnailRouter.delete('/delete:id', deleteThumbnail);

export default thumbnailRouter