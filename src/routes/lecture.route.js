const express = require('express');
const multer = require('multer');

const Course = require('../models/course.model');
const CourseSection = require('../models/courseSection.model');
const CourseLecture = require('../models/courseLecture.model');

const authentication = require('../middlewares/authentication.middleware');
const rolesValidation = require('../middlewares/rolesValidation.middleware');
const requestValidation = require('../middlewares/requestValidation.middleware');

const createLectureRequest = require('../requests/lecture/createLecture.request');

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

lectureRoute.post('/lectures', authentication, rolesValidation(['Admin', 'Teacher']), videoUploader.fields([{
  name: 'video',
  maxCount: 1,
}, {
  name: 'courseId',
  maxCount: 1,
}, {
  name: 'sectionId',
  maxCount: 1,
}, {
  name: 'lectureName',
  maxCount: 1,
}, {
  name: 'canPreview',
  maxCount: 1,
}]), requestValidation(createLectureRequest), async (req, res) => {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course || course.tutor !== req.user._id.toString()) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }

    const section = await CourseSection.findById(req.body.sectionId);
    if (!section || section.courseId !== course._id.toString()) {
      return res.status(404).send({
        error: 'Found no section!',
      });
    }

    const lecture = new CourseLecture({
      courseId: req.body.courseId,
      sectionId: req.body.sectionId,
      lectureName: req.body.lectureName,
      canPreview: req.body.canPreview === 'Yes',
      video: req.files.lecture[0].buffer,
    });
    await lecture.save();

    section.lectures.push({ lecture: lecture._id.toString() });
    await section.save();

    res.status(201).send({
      lecture,
    });
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

module.exports = lectureRoute;
