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
const deleteCourseRequest = require('../requests/course/deleteCourse.request');

const downloader = require('../utils/downloader');

const getListCoursesRequest = require('../requests/category/getListCourses.request');

const courseRoute = express.Router();

courseRoute.post('/courses', authentication, rolesValidation(['Teacher', 'Admin']), requestValidation(createCourseRequest), async (req, res) => {
  try {
    let coverImage = downloader(req.body.coverImage);
    coverImage = await sharp(req.body.coverImage).resize({
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
    const coursesPerPage = 12;
    const page = req.query.page ? req.query.page : 1;
    const skip = coursesPerPage * (page - 1);

    let listCourses = [];
    let totalCourses = 0;

    const selectedFields = '_id title summary tutor coverImage price sale categories isFinish totalRegistered';

    if (req.query.name) {
      totalCourses = await Course.find({
        name: {
          $regex: req.query.name,
          $options: 'i',
        },
      })
      .estimatedDocumentCount();

      listCourses = await Course.findById({
        name: {
          $regex: req.query.name,
          $options: 'i',
        },
      }, selectedFields)
      .skip(skip)
      .limit(coursesPerPage);
    }
    else {
      totalCourses = await Course.find({}).estimatedDocumentCount();
      listCourses = await Course.findById({}, selectedFields)
      .skip(skip)
      .limit(coursesPerPage);
    }

    res.send({
      listCourses,
      totalCourses,
      totalPages: Math.ceil(totalCourses / coursesPerPage),
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
    const selectedFields = '_id title summary description tutor coverImage price sale categories isFinish sections ratings totalRegistered';
    const course = await Course.findById(req.params.id, selectedFields);
    if (!course) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }

    res.send({
      course,
    });
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
    if (!course) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }

    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(404).send({
          error: 'Found no category!',
        });
      }
    }

    if (req.body.coverImage) {
      req.body.coverImage = downloader(req.body.coverImage);
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

courseRoute.delete('/courses/:id', authentication, rolesValidation(['Teacher', 'Admin']), requestValidation(deleteCourseRequest), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
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
