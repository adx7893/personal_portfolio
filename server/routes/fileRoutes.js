import express from 'express';
import multer from 'multer';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/errors.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { connectMongo, getFilesBucket, getMongoDb, isMongoEnabled, parseObjectId } from '../services/mongoService.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

router.post(
  '/files/upload',
  requireAuth,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!isMongoEnabled()) {
      throw new ApiError(400, 'MongoDB is not configured. Set MONGODB_URI to enable file storage.');
    }
    if (!req.file?.buffer?.length) {
      throw new ApiError(400, 'File is required in form field "file".');
    }

    await connectMongo();
    const bucket = getFilesBucket();

    const uploadStream = bucket.openUploadStream(req.file.originalname || 'upload.bin', {
      contentType: req.file.mimetype || 'application/octet-stream',
      metadata: {
        ownerId: req.user.id,
        uploadedAt: new Date().toISOString(),
      },
    });

    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
      uploadStream.end(req.file.buffer);
    });

    const fileId = String(uploadStream.id);

    res.status(201).json({
      success: true,
      data: {
        fileId,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/api/files/${fileId}`,
      },
    });
  })
);

router.get(
  '/files/:id',
  asyncHandler(async (req, res) => {
    if (!isMongoEnabled()) {
      throw new ApiError(400, 'MongoDB is not configured. Set MONGODB_URI to enable file storage.');
    }

    const objectId = parseObjectId(req.params.id);
    if (!objectId) throw new ApiError(400, 'Invalid file id.');

    await connectMongo();
    const db = getMongoDb();
    const bucket = getFilesBucket();

    const [fileDoc] = await db.collection('uploads.files').find({ _id: objectId }).limit(1).toArray();
    if (!fileDoc) throw new ApiError(404, 'File not found.');

    res.setHeader('Content-Type', fileDoc.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${fileDoc.filename || 'file'}"`);

    const stream = bucket.openDownloadStream(objectId);
    stream.on('error', () => {
      res.status(404).end();
    });
    stream.pipe(res);
  })
);

export { router as fileRoutes };

