const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'others';
    
    if (file.fieldname === 'audio' || file.mimetype.startsWith('audio/')) {
      folder = 'audio';
    } else if (file.fieldname === 'video' || file.mimetype.startsWith('video/')) {
      folder = 'video';
    } else if (file.fieldname === 'thumbnail' || file.fieldname === 'coverImage') {
      folder = 'images';
    }
    
    const folderPath = path.join(uploadsDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedAudio = /mp3|wav|m4a|aac|ogg/;
  const allowedVideo = /mp4|webm|mov|avi/;
  const allowedImage = /jpg|jpeg|png|gif|webp/;
  
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mimetype = file.mimetype;
  
  if (mimetype.startsWith('audio/') && allowedAudio.test(ext)) {
    cb(null, true);
  } else if (mimetype.startsWith('video/') && allowedVideo.test(ext)) {
    cb(null, true);
  } else if (mimetype.startsWith('image/') && allowedImage.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max file size
  }
});

module.exports = upload;
