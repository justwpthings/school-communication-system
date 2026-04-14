const fs = require('fs');
const path = require('path');
const multer = require('multer');

const AppError = require('../utils/AppError');
const { uploadsDir, maxUploadBytes } = require('../config/env');
const { deleteFiles } = require('../utils/fileHelpers');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    const safeBase = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase();

    cb(null, `${Date.now()}-${safeBase}${extension}`);
  }
});

const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = ['image/', 'video/', 'application/pdf'];
  const allowed = allowedMimeTypes.some((type) => file.mimetype.startsWith(type));

  if (!allowed) {
    return cb(new AppError('Only image, video, and PDF uploads are allowed', 400));
  }

  cb(null, true);
};

const uploader = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxUploadBytes,
    files: 10
  }
});

const enforceTotalUploadLimit = (req, _res, next) => {
  const files = req.files || [];
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  if (totalBytes > maxUploadBytes) {
    deleteFiles(files);
    return next(new AppError('Combined upload size cannot exceed 20MB', 400));
  }

  next();
};

const uploadNotificationMedia = [
  uploader.array('media', 10),
  enforceTotalUploadLimit
];

module.exports = {
  uploadNotificationMedia
};
