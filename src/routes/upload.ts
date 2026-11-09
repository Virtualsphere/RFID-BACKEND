import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'fs';
import { protect, admin } from '../middleware/auth';
import { uploadImage, uploadImages } from '../controllers/uploadController';

const router = express.Router();

// Ensure uploads directory exists with proper permissions (0o755 = rwxr-xr-x)
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
} else {
  // Ensure existing directory has correct permissions
  try {
    fs.chmodSync(uploadDir, 0o755);
  } catch (e) {
    console.warn('Could not set uploads directory permissions:', e);
  }
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! Accepted formats: jpg, jpeg, png, webp'));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

// Multer error handler middleware
function handleMulterError(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err) {
    // Permission denied or other filesystem errors
    if (err.code === 'EACCES') {
      console.error('Upload permission denied:', err);
      return res.status(500).json({
        message: 'Server configuration error: uploads directory is not writable. Please contact support.',
      });
    }
    return res.status(400).json({ message: err.message || 'Upload failed' });
  }
  next();
}

// @route   POST /api/upload
// @desc    Upload an image
router.post('/', protect, admin, upload.single('image'), handleMulterError, uploadImage);

// @route   POST /api/upload/multiple
// @desc    Upload multiple images
router.post('/multiple', protect, admin, upload.array('images', 10), handleMulterError, uploadImages);

export default router;
