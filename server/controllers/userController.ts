import { Request, Response } from 'express';
import Thumbnail from '../models/Thumbnail.js';

// Controllers to GET All User Thumbnails
export const getUsersThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session;

    const thumbnails = await Thumbnail.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({ thumbnails });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message || 'Server Error!' });
  }
};

// controllers to get single Thumbnail of a User

export const getThumbnailById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session;
    const { id } = req.params;

    const thumbnail = await Thumbnail.findOne({ userId, _id: id });

    return res.status(200).json({ thumbnail });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message || 'Server Error!' });
  }
};
