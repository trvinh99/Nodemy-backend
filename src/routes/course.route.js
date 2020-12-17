const express = require('express');
const sharp = require('sharp');
const multer = require('multer');

const authentication = require('../middlewares/authentication.middleware');
const requestValidation = require('../middlewares/requestValidation.middleware');
const teacher = require('../middlewares/teacher.middleware');
const createCourseRequest = require('../requests/course/createCourse.request');

const courseRoute = express.Router();

courseRoute.post('/courses', authentication, teacher, requestValidation(createCourseRequest), async (req, res) => {
  try {

  }
  catch (error) {

  }
});

module.exports = courseRoute;
