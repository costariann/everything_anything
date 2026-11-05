import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { env } from '../../config/env';
import { logger } from './logger';

let isCloudinaryConfigured = false;

export function initCloudinary(): boolean {
  if (isCloudinaryConfigured) return true;

  // 1. Check if CLOUDINARY_URL is available
  const cldUrl = env.CLOUDINARY_URL || process.env.CLOUDINARY_URL;
  if (cldUrl && cldUrl.startsWith('cloudinary://')) {
    const match = cldUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@([^/]+)/);
    if (match) {
      cloudinary.config({
        cloud_name: match[3],
        api_key: match[1],
        api_secret: match[2],
        secure: true,
      });
      isCloudinaryConfigured = true;
      logger.info(`☁️ Cloudinary initialized via CLOUDINARY_URL for cloud: ${match[3]}`);
      return true;
    }
  }

  // 2. Check explicit credentials
  const cloudName = env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    isCloudinaryConfigured = true;
    logger.info(`☁️ Cloudinary initialized for cloud_name: ${cloudName}`);
    return true;
  }

  return false;
}

// Auto-init on module load
initCloudinary();

/**
 * Uploads media buffer to Cloudinary (or falls back locally if not configured)
 */
export async function uploadMediaToCloudinary(
  buffer: Buffer,
  originalName: string,
  _contentType: string,
  folder = 'products',
  hostBaseUrl = 'http://localhost:4000'
): Promise<string> {
  const extension = path.extname(originalName) || '.jpg';
  const cleanBaseName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${Date.now()}_${cleanBaseName}`;

  // 1. Attempt Cloudinary upload if configured
  if (initCloudinary()) {
    try {
      const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `everythinganything/${folder}`,
            public_id: filename,
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) {
              return reject(error || new Error('Cloudinary upload returned empty result'));
            }
            resolve(result);
          }
        );

        Readable.from(buffer).pipe(uploadStream);
      });

      logger.info(`☁️ Successfully uploaded ${filename} to Cloudinary: ${uploadResult.secure_url}`);
      return uploadResult.secure_url;
    } catch (cldError: any) {
      logger.warn(`⚠️ Cloudinary upload failed (${cldError.message}). Defaulting to local media storage.`);
    }
  } else {
    logger.info('ℹ️ Cloudinary credentials not configured yet. Defaulting to local media storage.');
  }

  // 2. Seamless local storage fallback
  try {
    const localFolder = path.resolve(process.cwd(), 'uploads', folder);
    if (!fs.existsSync(localFolder)) {
      fs.mkdirSync(localFolder, { recursive: true });
    }
    const fullFileName = `${filename}${extension}`;
    const localFilePath = path.join(localFolder, fullFileName);
    fs.writeFileSync(localFilePath, buffer);
    logger.info(`💾 Saved image locally to ${localFilePath}`);

    const publicUrl = `${hostBaseUrl}/uploads/${folder}/${fullFileName}`;
    return publicUrl;
  } catch (localError: any) {
    logger.error('Failed to save image locally:', localError);
    throw new Error('Failed to upload image: ' + localError.message);
  }
}
