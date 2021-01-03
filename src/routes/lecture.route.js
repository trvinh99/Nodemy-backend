const express = require('express');
const multer = require('multer');
const fs = require('fs');
const jwt = require("jsonwebtoken");

const Course = require('../models/course.model');
const CourseSection = require('../models/courseSection.model');
const CourseLecture = require('../models/courseLecture.model');
const User = require('../models/user.model');

const authentication = require('../middlewares/authentication.middleware');
const rolesValidation = require('../middlewares/rolesValidation.middleware');
const requestValidation = require('../middlewares/requestValidation.middleware');

const createLectureRequest = require('../requests/lecture/createLecture.request');
const updateLecture = require('../requests/lecture/updateLecture.request');

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
      video: req.files.video[0].buffer,
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

lectureRoute.patch('/lectures/:id', authentication, rolesValidation(['Admin', 'Teacher']), requestValidation(updateLecture), async (req, res) => {
  try {
    const lecture = await CourseLecture.findById(req.params.id);
    if (!lecture) {
      return res.status(404).send({
        error: 'Found no lecture!',
      });
    }

    const course = await Course.findById(lecture.courseId);
    if (course.tutor !== req.user._id.toString()) {
      return res.status(404).send({
        error: 'Found no lecture!',
      });
    }

    let hasChanged = false;
    Object.keys(req.body).forEach((prop) => {
      if (req.body[prop] !== lecture[prop]) {
        lecture[prop] = req.body[prop];
        hasChanged = true;
      }
    });

    if (hasChanged) {
      await lecture.save();
    }

    res.send({
      lecture,
    });
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

lectureRoute.patch('/lectures/:id/video', authentication, rolesValidation(['Admin', 'Teacher']), videoUploader.single('video'), async (req, res) => {
  try {
    const lecture = await CourseLecture.findById(req.params.id);
    if (!lecture) {
      return res.status(404).send({
        error: 'Found no lecture!',
      });
    }

    const course = await Course.findById(lecture.courseId);
    if (course.tutor !== req.user._id.toString()) {
      return res.status(404).send({
        error: 'Found no lecture!',
      });
    }

    lecture.video = req.file.buffer;
    await lecture.save();

    res.send({
      lecture,
    });
  }
  catch (error) {
    res.status(400).send({
      error: error.message,
    });
  }
});

lectureRoute.get('/lectures/:sectionId', authentication, async (req, res) => {
  try {
    const section = await CourseSection.findById(req.params.sectionId);
    if (!section) {
      return res.status(404).send({
        error: 'Found no section!',
      });
    }

    const lectures = [];
    for (let i = 0; i < section.lectures.length; ++i) {
      const lecture = await CourseLecture.findById(section.lectures[i].lecture);
      if (lecture) {
        lectures.push(lecture);
      }
    }

    res.send({
      lectures,
    });
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error!',
    });
  }
});

lectureRoute.get('/lectures/:id/video', async (req, res) => {
  try {
    const decode = jwt.verify(req.query.token, process.env.JWT_SECRET);
    const user = await User.findById(decode._id);
    if (!user) {
      return res.status(403).send({
        error: "Please authenticate!",
      });
    }

    const lecture = await CourseLecture.findById(req.params.id);
    if (!lecture) {
      return res.status(404).send({
        error: 'Found no lecture!',
      });
    }

    let hasBought = -1;
    for (let i = 0; i < user.boughtCourses.legnth; ++i) {
      if (user.boughtCourses[i].courseId === lecture.courseId) {
        hasBought = i;
        break;
      }
    }

    if (hasBought !== -1 || lecture.canPreview) {
      const stat = fs.statSync(lecture.video);
      const fileSize = stat.size;
    
      if (req.headers.range) {
        const parts = req.headers.range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
        const chunksize = (end - start) + 1
        const file = fs.createReadStream(lecture.video, {start, end})
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        }
        res.writeHead(206, head);
        file.pipe(res);
      }
      else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(lecture.video).pipe(res);
      }
    }
    else {
      return res.status(400).send({
        error: 'You have not bought this course yet!',
      });
    }
  }
  catch (error) {
    res.status(400).send({
      error: error.message,
    });
  }
});

lectureRoute.delete('/lectures/:id', authentication, rolesValidation(['Admin', 'Teacher']), async (req, res) => {
  try {
    const lecture = await CourseLecture.findById(req.params.id);
    if (!lecture) {
      return res.status(404).send({
        error: 'Found no lecture!',
      });
    }

    const course = await Course.findById(lecture.courseId);
    if (course.tutor !== req.user._id.toString()) {
      return res.status(404).send({
        error: 'Found no lecture!',
      });
    }

    const section = await CourseSection.findById(lecture.sectionId);
    section.lectures = section.lectures.filter((subLecture) => subLecture.lecture !== lecture._id.toString());

    await lecture.delete();
    await section.save();
    
    res.send({
      lecture,
    });
  }
  catch {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

module.exports = lectureRoute;
