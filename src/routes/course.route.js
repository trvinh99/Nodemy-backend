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
const buyCourseRequest = require('../requests/course/buyCourse.request');

const downloader = require('../utils/downloader');
const sendPurchasedNotification = require('../emails/sendPurchasedNotification.email');
const bypassAuthentication = require('../middlewares/bypassAuthentication.middleware');
const Rating = require('../models/rating.model');

const courseRoute = express.Router();

courseRoute.post('/courses', authentication, rolesValidation(['Teacher', 'Admin']), requestValidation(createCourseRequest), async (req, res) => {
  try {
    let coverImage = await downloader(req.body.coverImage);
    coverImage = await sharp(coverImage).resize({
      height: 270,
      width: 480,
    }).png().toBuffer();

    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(404).send({
        error: 'Found no category!',
      });
    }

    const course = new Course({
      ...req.body,
      sale: req.body.price - req.body.price * (req.body.saleRatio / 100),
      coverImage,
      tutor: req.user._id.toString(),
    });
    await course.save();

    ++category.totalCourses;
    await category.save();

    res.status(201).send({
      course: await course.packCourseContent(req.user),
    });
  }
  catch (error) {
    res.status(400).send({
      error: error.message,
    });
  }
});

courseRoute.get('/courses', bypassAuthentication, requestValidation(getListCoursesRequest), async (req, res) => {
  try {
    const listCourses = await Course.getListCourses(
      true,
      parseInt(req.query.page) || 1,
      req.query.title,
      req.query.category,
      req.query.sort,
      req.user,
      '',
      { isSuspended: false }
    );
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
    const courses = await Course
    .find({ tutor: req.user._id.toString() })
    .select('_id title summary tutor price sale category totalRatings createdAt averageRatings updatedAt');

    for (let i = 0; i < courses.length; ++i) {
      courses[i] = await courses[i].packCourseContent(req.user);
    }
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

courseRoute.get('/courses/admin', authentication, rolesValidation(['Admin']), async (req, res) => {
  try {
    const courses = await Course
    .find()
    .select('_id title summary tutor price sale category totalRatings createdAt averageRatings updatedAt isSuspended')
    res.send({
      courses,
    });
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
    let course = await Course.findById(req.params.id);
    if (!course || course.tutor !== req.user._id.toString()) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }

    course = await course.packCourseContent(req.user);
    course.isInWishlist = false;
    course.isInCart = false

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

courseRoute.get('/courses/admin/:id', authentication, rolesValidation(['Admin']), requestValidation(getCourseRequest), async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }

    course = await course.packCourseContent(req.user);
    course.isInWishlist = false;
    course.isInCart = false

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

courseRoute.get('/courses/top-viewed', bypassAuthentication, async (req, res) => {
  try {
    const courses = await Course
    .find({ isSuspended: false })
    .select('_id title summary tutor price sale category totalRatings createdAt averageRatings updatedAt')
    .sort({ totalViewed: 'desc' })
    .limit(10);

    for (let i = 0; i < courses.length; ++i) {
      courses[i] = await courses[i].packCourseContent(req.user);
    }

    res.send({
      courses
    });
  }
  catch {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

courseRoute.get('/courses/new', bypassAuthentication, async (req, res) => {
  try {
    let courses = await Course
    .find({ isPublic: true, isSuspended: false })
    .select('_id title summary tutor price sale category totalRatings createdAt averageRatings updatedAt')
    .sort({ createdAt: 'desc' })
    .limit(10);

    for (let i = 0; i < courses.length; ++i) {
      courses[i] = await courses[i].packCourseContent(req.user);
    }

    courses = courses.filter((course) => course.isNew);

    res.send({
      courses,
    });
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

courseRoute.get('/courses/hot', bypassAuthentication, async (req, res) => {
  try {
    let courses = await Course
    .find({ isSuspended: false })
    .sort({ sale: 'desc' })
    .select('_id title summary tutor price sale category totalRatings createdAt averageRatings updatedAt')
    .limit(5);

    for (let i = 0; i < courses.length; ++i) {
      courses[i] = await courses[i].packCourseContent(req.user);
    }
    courses = courses.filter((course) => course.isHot);

    res.send({
      courses,
    });
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

courseRoute.get('/courses/:id', bypassAuthentication, requestValidation(getCourseRequest), async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course || !course.isPublic || course.isSuspended) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }

    course = await Course.increaseTotalViewed(course._id.toString());
    course = await course.packCourseContent(req.user);
    course.isInWishlist = false;
    if (req.user) {
      for (let i = 0; i < req.user.wishlist.length; ++i) {
        if (req.user.wishlist[i].courseId === course._id.toString()) {
          course.isInWishlist = true;
          break;
        }
      }
    }
    course.isInCart = false;
    if (req.user) {
      for (let i = 0; i < req.user.cart.length; ++i) {
        if (req.user.cart[i].courseId === course._id.toString()) {
          course.isInCart = true;
          break;
        }
      }
    }

    res.send({
      course,
    });
  }
  catch (error) {
    console.log(error.message);
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
    let course = await Course.findById(req.params.id);
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
        height: 270,
        width: 480,
      }).png().toBuffer();
    }

    let hasChanged = false;

    Object.keys(req.body).forEach((prop) => {
      if (req.body.hasOwnProperty('coverImage') || course[prop] !== req.body[prop]) {
        hasChanged = true;
        course[prop] = req.body[prop];
      }
      if (req.body.hasOwnProperty('saleRatio') || req.body.hasOwnProperty('price')) {
        course.sale = course.price - course.price * (course.saleRatio / 100);
      }
    });

    if (hasChanged) {
      await course.save();
    }

    course = await course.packCourseContent(req.user);
    course.isInWishlist = false;
    course.isInCart = false;

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

courseRoute.delete('/courses/admin/:id', authentication, rolesValidation(['Admin']), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }

    course.isSuspended = true;
    await course.save();
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

    const ratings = await Rating.find({ courseId: course._id.toString() });
    for (let i = 0; i < ratings.length; ++i) {
      try {
        await ratings[i].delete();
      }
      catch { /** ignored */ }
    }

    await course.delete();

    --category.totalCourses;
    const cloneCourse = await course.packCourseContent(req.user);
    cloneCourse.isInWishlist = false;
    cloneCourse.isInCart = false;
    await category.save();

    res.send({
      course: cloneCourse,
    });
  }
  catch (error) {
    res.status(400).send({
      error: error.message,
    });
  }
});

courseRoute.patch('/courses/:id/buy', authentication, requestValidation(buyCourseRequest), async (req, res) => {
  try {
    for (let i = 0; i < req.user.boughtCourses.length; ++i) {
      if (req.user.boughtCourses[i].courseId === req.params.id) {
        return res.send({
          message: 'You have already purchased this course!',
        });
      }
    }

    const course = await Course.findById(req.params.id);
    if (!course || !course.isPublic) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }

    if (course.tutor === req.user._id.toString()) {
      return res.send({
        message: 'You own this course!',
      });
    }

    ++course.totalRegistered;

    req.user.boughtCourses.push({
      courseId: course._id.toString(),
    });

    await course.save();
    await req.user.save();

    await Category.updateTotalRegisteredLastWeek(course.category);

    sendPurchasedNotification(req.user.email, req.user.fullname, course.title);

    res.send({
      message: 'You have purchased this course successfully!',
    });
  }
  catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
});

courseRoute.get('/courses/:id/same-category', bypassAuthentication, requestValidation(getCourseRequest), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || !course.isPublic) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }

    const courses = await Course.find({
      category: course.category,
    })
    .select('_id title summary tutor price sale category totalRatings createdAt averageRatings updatedAt')
    .sort({ totalRegistered: 'desc' })
    .limit(5);

    for (let i = 0; i < courses.length; ++i) {
      courses[i] = await courses[i].packCourseContent(req.user);
    }

    res.send({
      courses,
    });
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

module.exports = courseRoute;
