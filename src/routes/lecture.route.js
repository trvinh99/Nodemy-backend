const express = require('express');
const multer = require('multer');

const authentication = require('../middlewares/authentication.middleware');
const rolesValidation = require('../middlewares/rolesValidation.middleware');

const lectureRoute = express.Router();

const videoUploader = multer({
  limits: {
    fileSize: 100000000, // 100MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.mp4$/)) {
      return cb(new Error('Please upload a valid MP4 video!'));
    }

    cb(undefined, true);
  }
});

lectureRoute.post('/lectures', authentication, rolesValidation(['Admin', 'Teacher']), videoUploader.single('lecture'), async (req, res) => {
  try {
    
  }
  catch {

  }
});

module.exports = lectureRoute;
