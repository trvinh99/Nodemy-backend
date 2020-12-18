const express = require('express');
const sharp = require('sharp');

const Course = require('../models/course.model');
const Category = require('../models/category.model');

const authentication = require('../middlewares/authentication.middleware');
const requestValidation = require('../middlewares/requestValidation.middleware');
const teacher = require('../middlewares/teacher.middleware');
const createCourseRequest = require('../requests/course/createCourse.request');

const downloader = require('../utils/downloader');
const NodemyResponseError = require('../utils/NodemyResponseError');

const createCourseError = require('../responses/course/createCourse.response');

const courseRoute = express.Router();

courseRoute.post('/courses', authentication, teacher, requestValidation(createCourseRequest), async (req, res) => {
  try {
    let coverImage = downloader(req.body.coverImage);
    coverImage = await sharp(req.body.coverImage).resize({
      height: 400,
      width: 600,
    }).png().toBuffer();

    let hasInvalidCategory = false;
    const categories = [];
    try {
      for (let i = 0; i < req.body.categories.length; ++i) {
        const category = await Category.findById(req.body.categories[i]);
        if (!category) {
          hasInvalidCategory = true;
          break;
        }
        categories.push({ category: req.body.categories[i] });
      }
    }
    catch (categoryError) {
      hasInvalidCategory = true;
    }

    if (hasInvalidCategory) {
      throw new NodemyResponseError(400, 'Found no match category!');
    }

    const course = new Course({
      ...req.body,
      coverImage,
      categories,
    });
    await course.save();

    res.status(201).send({
      course,
    });
  }
  catch (error) {
    createCourseError(res, error);
  }
});

module.exports = courseRoute;
