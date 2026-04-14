const fs = require('fs');

const deleteFiles = (files = []) => {
  files.forEach((file) => {
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  });
};

const resolveFileType = (mimeType = '') => {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }

  if (mimeType.startsWith('video/')) {
    return 'video';
  }

  return 'pdf';
};

module.exports = {
  deleteFiles,
  resolveFileType
};
