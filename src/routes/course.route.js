const express = require('express');
const sharp = require('sharp');

const Course = require('../models/course.model');
const Category = require('../models/category.model');
const CourseSection = require('../models/courseSection.model');
const CourseLecture = require('../models/courseLecture.model');

const authentication = require('../middlewares/authentication.middleware');
const requestValidation = require('../middlewares/requestValidation.middleware');
const rolesValidation = require('../middlewares/rolesValidation.middleware');
const createCourseRequest = require('../requests/course/createCourse.request');
const updateCourseRequest = require('../requests/course/updateCourse.request');
const getCourseRequest = require('../requests/course/getCourse.request');
const getListCoursesRequest = require('../requests/course/getListCourses.request');

const downloader = require('../utils/downloader');

const courseRoute = express.Router();

courseRoute.post('/courses', authentication, rolesValidation(['Teacher', 'Admin']), requestValidation(createCourseRequest), async (req, res) => {
  try {
    let coverImage = await downloader(req.body.coverImage);
    coverImage = await sharp(coverImage).resize({
      height: 400,
      width: 600,
    }).png().toBuffer();

    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(404).send({
        error: 'Found no category!',
      });
    }

    const course = new Course({
      ...req.body,
      coverImage,
      tutor: req.user._id.toString(),
    });
    await course.save();

    ++category.totalCourses;
    await category.save();

    res.status(201).send({
      course,
    });
  }
  catch (error) {
    res.status(400).send({
      error: error.message,
    });
  }
});

courseRoute.get('/courses', requestValidation(getListCoursesRequest), async (req, res) => {
  try {
    const listCourses = await Course.getListCourses(true, req.query.page, req.query.title, req.query.category);
    res.send(listCourses);
  }
  catch (error) {
    console.log(error.message)
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

courseRoute.get('/courses/me', authentication, rolesValidation(['Teacher', 'Admin']), async (req, res) => {
  try {
    const selectedFields = '_id title summary tutor price sale category isFinish totalRegistered';
    const courses = await Course.find({ tutor: req.user._id.toString() }).select(selectedFields);
    res.send({
      courses,
    });
  }
  catch {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

courseRoute.get('/courses/admin', authentication, rolesValidation(['Admin']), requestValidation(getListCoursesRequest), async (req, res) => {
  try {
    const listCourses = await Course.getListCourses(false, req.query.page, req.query.title, req.query.category);
    res.send(listCourses);
  }
  catch (error) {
    console.log(error.message)
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

courseRoute.get('/courses/me/:id', authentication, rolesValidation(['Teacher', 'Admin']), requestValidation(getCourseRequest), async (req, res) => {
  try {
    const selectedFields = '_id title summary description tutor coverImage price sale category isPublic isFinish sections ratings totalRegistered';
    const course = await Course.findById(req.params.id).select(selectedFields);
    if (!course || course.tutor !== req.user._id.toString()) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }

    const category = (await Category.findById(course.category)).name;

    res.send({
      course: {
        ...course,
        categoryName: category
      },
    });
  }
  catch {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

courseRoute.get('/courses/admin/:id', authentication, rolesValidation(['Admin']), requestValidation(getCourseRequest), async (req, res) => {
  try {
    const selectedFields = '_id title summary description tutor coverImage price sale category isPublic isFinish sections ratings totalRegistered';
    const course = await Course.findById(req.params.id).select(selectedFields);
    if (!course) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }

    const category = (await Category.findById(course.category)).name;

    res.send({
      course: {
        ...course,
        categoryName: category
      },
    });
  }
  catch {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

courseRoute.get('/courses/:id', requestValidation(getCourseRequest), async (req, res) => {
  try {
    const selectedFields = '_id title summary description tutor coverImage price sale category isPublic isFinish sections ratings totalRegistered';
    const course = await Course.findById(req.params.id).select(selectedFields);
    if (!course || !course.isPublic) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }

    const category = (await Category.findById(course.category)).name;
    delete course.isPublic;

    res.send({
      course: {
        ...course.toJSON(),
        coverImage: `${process.env.HOST}/courses/${course._id.toString()}/cover-image`,
        categoryName: category,
      },
    });
  }
  catch {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

courseRoute.get('/courses/:id/cover-image', requestValidation(getCourseRequest), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }

    res.set({ 'Content-Type': 'image/png' });
    res.end(course.coverImage, 'binary');
  }
  catch {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

courseRoute.patch('/courses/:id', authentication, rolesValidation(['Teacher', 'Admin']), requestValidation(updateCourseRequest), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || course.tutor !== req.user._id.toString()) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }

    if (req.body.category && req.body.category !== course.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(404).send({
          error: 'Found no category!',
        });
      }
    }

    if (req.body.coverImage) {
      req.body.coverImage = await downloader(req.body.coverImage);
      req.body.coverImage = await sharp(req.body.coverImage).resize({
        height: 400,
        width: 600,
      }).png().toBuffer();
    }

    let hasChanged = false;

    Object.keys(req.body).forEach((prop) => {
      if (req.body.hasOwnProperty('coverImage') || course[prop] !== req.body[prop]) {
        hasChanged = true;
        course[prop] = req.body[prop];
      }
    });

    if (hasChanged) {
      await course.save();
    }

    res.send({
      course,
    });
  }
  catch (error) {
    res.status(400).send({
      error: error.message,
    });
  }
});

courseRoute.delete('/courses/:id', authentication, rolesValidation(['Teacher', 'Admin']), requestValidation(getCourseRequest), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || (req.user.role === 'Teacher' && req.user._id.toString() !== course.tutor)) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }

    const category = await Category.findById(course.category);
    // just to make sure if the db wasn't hacked...
    if (!category) {
      return res.status(500).send({
        error: 'Internal Server Error',
      });
    }

    const lectures = await CourseLecture.find({ courseId: course._id.toString() });
    for (let i = 0; i < lectures.length; ++i) {
      try {
        await lectures[i].delete();
      }
      catch { /** ignored */ }
    }

    const sections = await CourseSection.find({ courseId: course._id.toString() });
    for (let i = 0; i < sections.length; ++i) {
      try {
        await sections[i].delete();
      }
      catch { /** ignored */ }
    }

    await course.delete();

    --category.totalCourses;
    await category.save();

    res.send({
      course,
    });
  }
  catch (error) {
    res.status(400).send({
      error: error.message,
    });
  }
});

module.exports = courseRoute;
