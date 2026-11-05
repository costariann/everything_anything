import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authGuard } from '../../shared/middleware/authGuard';
import { roleGuard } from '../../shared/middleware/roleGuard';
import { uploadMediaToCloudinary } from '../../shared/utils/cloudinaryStorage';
import { sendSuccess } from '../../shared/utils/response';
import { BadRequestError } from '../../shared/errors/AppError';
import { logger } from '../../shared/utils/logger';

export const mediaRoutes = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only image files are allowed.'));
    }
  },
});

mediaRoutes.post(
  '/upload',
  authGuard,
  roleGuard('ADMIN'),
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new BadRequestError('No image file provided.');
      }

      const hostBaseUrl = `${req.protocol}://${req.get('host')}`;
      const publicUrl = await uploadMediaToCloudinary(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        'products',
        hostBaseUrl
      );

      return sendSuccess(
        res,
        {
          url: publicUrl,
          originalName: req.file.originalname,
          size: req.file.size,
        },
        'Media uploaded successfully',
        201
      );
    } catch (error: any) {
      logger.error('Media upload route error:', error);
      next(error);
      return;
    }
  }
);
