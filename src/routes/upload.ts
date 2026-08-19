import path from 'path';
import crypto from 'crypto';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { protect, admin } from '../middleware/auth';
import { uploadImage, uploadImages } from '../controllers/uploadController';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    // Date.now() alone collides: multer writes a multi-file upload one after
    // another, so two images in the same batch can land in the same
    // millisecond and the second silently overwrites the first. Two products
    // in the live database already lost an image this way. The random suffix
    // makes each name unique.
    const unique = crypto.randomBytes(6).toString('hex');
    cb(
      null,
      `${file.fieldname}-${Date.now()}-${unique}${path.extname(file.originalname)}`
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
    cb(new Error('Images only!'));
  }
}

const upload = multer({
  storage,
  // There was no size cap, which is how ~500 KB (and larger) originals ended up
  // in the catalog. 5 MB is a generous ceiling that still rejects accidental
  // uploads of unprocessed camera files.
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// @route   POST /api/upload
// @desc    Upload an image
router.post('/', protect, admin, upload.single('image'), uploadImage);

// @route   POST /api/upload/multiple
// @desc    Upload multiple images
router.post('/multiple', protect, admin, upload.array('images', 10), uploadImages);

export default router;
