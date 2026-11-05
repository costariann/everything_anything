import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { env } from '../../config/env';
import { logger } from './logger';

let cachedBucket: any = null;

function initFirebase(): App | null {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  // Check potential paths for serviceAccountKey.json
  const candidatePaths = [
    path.resolve(process.cwd(), env.FIREBASE_SERVICE_ACCOUNT_PATH),
    path.resolve(process.cwd(), '..', env.FIREBASE_SERVICE_ACCOUNT_PATH),
    path.resolve(__dirname, '../../../../serviceAccountKey.json'),
    path.resolve(__dirname, '../../../serviceAccountKey.json'),
  ];

  let keyPath: string | null = null;
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      keyPath = p;
      break;
    }
  }

  if (!keyPath) {
    logger.warn('⚠️ serviceAccountKey.json not found. Firebase Storage upload will not be available.');
    return null;
  }

  try {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    const app = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
    });
    logger.info('🔥 Firebase Admin initialized successfully for media uploads');
    return app;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin:', error);
    return null;
  }
}

// Auto-initialize if possible
initFirebase();

/**
 * Resolves the active Firebase Storage bucket.
 * Handles both traditional (.appspot.com) and newer (.firebasestorage.app) domain formats.
 */
async function resolveBucket(app: App) {
  if (cachedBucket) return cachedBucket;

  const storage = getStorage(app);

  // 1. Check if configured bucket exists
  if (env.FIREBASE_STORAGE_BUCKET) {
    try {
      const configuredBucket = storage.bucket(env.FIREBASE_STORAGE_BUCKET);
      const [exists] = await configuredBucket.exists();
      if (exists) {
        cachedBucket = configuredBucket;
        return cachedBucket;
      }
    } catch {
      // Configured bucket check failed or non-existent
    }
  }

  // 2. Try the two official Firebase bucket naming conventions
  const projectId = 'everythinganything-fc7ee';
  const candidates = [
    `${projectId}.firebasestorage.app`,
    `${projectId}.appspot.com`,
  ];

  for (const name of candidates) {
    try {
      const candidate = storage.bucket(name);
      const [exists] = await candidate.exists();
      if (exists) {
        logger.info(`🔥 Auto-detected active Firebase Storage bucket: ${name}`);
        cachedBucket = candidate;
        return cachedBucket;
      }
    } catch {
      // Candidate bucket does not exist
    }
  }

  // 3. Query all project buckets dynamically
  try {
    const [buckets] = await storage.bucket().storage.getBuckets();
    if (buckets && buckets.length > 0) {
      logger.info(`🔥 Detected active project bucket from list: ${buckets[0].name}`);
      cachedBucket = buckets[0];
      return cachedBucket;
    }
  } catch {
    // List bucket call failed
  }

  // Default to configured bucket reference (will throw descriptive error if uninitialized)
  return storage.bucket(env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`);
}

export async function uploadMediaToFirebase(
  buffer: Buffer,
  originalName: string,
  contentType: string,
  folder = 'products',
  hostBaseUrl = 'http://localhost:4000'
): Promise<string> {
  const extension = path.extname(originalName) || '.jpg';
  const cleanBaseName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${Date.now()}_${cleanBaseName}${extension}`;

  // 1. Attempt upload to Firebase Storage
  try {
    const app = initFirebase();
    if (app) {
      const bucket = await resolveBucket(app);
      const destination = `${folder}/${filename}`;
      const file = bucket.file(destination);
      const downloadToken = crypto.randomUUID();

      await file.save(buffer, {
        resumable: false,
        metadata: {
          contentType,
          metadata: {
            firebaseStorageDownloadTokens: downloadToken,
          },
        },
      });

      try {
        await file.makePublic();
      } catch {
        // Ignored if uniform bucket level access is enforced
      }

      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media&token=${downloadToken}`;
      logger.info(`🔥 Successfully uploaded ${filename} to Firebase Storage: ${publicUrl}`);
      return publicUrl;
    }
  } catch (fbError: any) {
    logger.warn(
      `⚠️ Firebase Storage upload failed (${fbError.message}). Defaulting to local media storage.`
    );
  }

  // 2. Seamless local storage fallback (so product uploads ALWAYS succeed)
  try {
    const localFolder = path.resolve(process.cwd(), 'uploads', folder);
    if (!fs.existsSync(localFolder)) {
      fs.mkdirSync(localFolder, { recursive: true });
    }
    const localFilePath = path.join(localFolder, filename);
    fs.writeFileSync(localFilePath, buffer);
    logger.info(`💾 Saved image locally to ${localFilePath}`);

    const publicUrl = `${hostBaseUrl}/uploads/${folder}/${filename}`;
    return publicUrl;
  } catch (localError: any) {
    logger.error('Failed to save image locally:', localError);
    throw new Error('Failed to upload image: ' + localError.message);
  }
}
