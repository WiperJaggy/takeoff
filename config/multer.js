const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 , // limit file size to 5MB
    fileCount: 5
  },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

module.exports = upload;
