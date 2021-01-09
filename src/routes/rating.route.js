const express = require('express');

const Course = require('../models/course.model');
const Rating = require('../models/rating.model');

const authentication = require('../middlewares/authentication.middleware');
const requestValidation = require('../middlewares/requestValidation.middleware');

const createRatingRequest = require('../requests/rating/createRating.request');
const getRatingsRequest = require('../requests/rating/getRatings.request');
const updateRatingRequest = require('../requests/rating/updateRating.request');
const deleteRatingRequest = require('../requests/rating/deleteRating.request');
const getOwnRatingRequest = require('../requests/rating/getOwnRating.request');

const ratingRoute = express.Router();

ratingRoute.post('/ratings', authentication, requestValidation(createRatingRequest), async (req, res) => {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }

    if (req.user.accountType !== 'Admin' && course.tutor !== req.user._id.toString()) {
      let hasBought = false;
      for (let i = 0; i < req.user.boughtCourses.length; ++i) {
        if (req.user.boughtCourses[i].courseId === req.body.courseId) {
          hasBought = true;
          break;
        }
      }

      if (!hasBought) {
        return res.status(400).send({
          error: 'You have not bought this course yet!',
        });
      }
    }

    let rating = await Rating.findOne({ courseId: req.body.courseId, userId: req.user._id.toString() });
    if (rating) {
      return res.status(400).send({
        message: 'You can not start another rating for this course!',
      });
    }

    rating = new Rating({
      ...req.body,
      userId: req.user._id.toString(),
    });
    await rating.save();

    let averageRatings = course.averageRatings * course.ratings.length;
    averageRatings += req.body.rating;
    course.ratings.push({ rating: rating._id.toString() });
    averageRatings /= course.ratings.length;
    course.averageRatings = averageRatings;
    ++course.totalRatings;
    await course.save();

    res.status(201).send({
      rating,
    });
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

ratingRoute.get('/ratings/:courseId', requestValidation(getRatingsRequest), async (req, res) => {
  try {
    const ratings = await Rating.getListRatings(req.query.page || 1, req.params.courseId);
    res.send(ratings);
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

ratingRoute.get('/ratings/:courseId/me', authentication, requestValidation(getOwnRatingRequest), async (req, res) => {
  try {
    let hasBought = false;
    for (let i = 0; i < req.user.boughtCourses.length; ++i) {
      if (req.user.boughtCourses[i].courseId === req.params.courseId) {
        hasBought = true;
        break;
      }
    }

    if (!hasBought) {
      return res.status(400).send({
        error: 'You have not bought this course yet!',
      });
    }

    const rating = await Rating.findOne({ courseId: req.params.courseId, userId: req.user._id.toString() });
    if (!rating) {
      return res.status(404).send({
        error: 'Found no rating!',
      });
    }

    res.send({
      rating: {
        ...rating,
        fullname: req.user.fullname,
        avatar: req.user.avatar
      },
    });
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
})

ratingRoute.patch('/ratings/:id', authentication, requestValidation(updateRatingRequest), async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) {
      return res.status(404).send({
        error: 'Found no rating!',
      });
    }

    if (rating.userId !== req.user._id.toString()) {
      return res.status(400).send({
        error: 'You can not edit other rating!',
      });
    }

    let hasChanged = false;
    Object.keys(req.body).forEach((prop) => {
      if (rating[prop] !== req.body[prop]) {
        rating[prop] = req.body[prop];
        hasChanged = true;
      }
    });

    if (req.body.rating) {
      const course = await Course.findById(req.params.courseId);
      if (!course) {
        await rating.delete();
        return res.status(404).send({
          error: 'Found no course',
        });
      }

      let averageRatings = course.averageRatings * course.ratings.length;
      averageRatings = averageRatings - rating.rating + req.body.rating;
      course.averageRatings = averageRatings / course.ratings.length;
      await course.save();
    }

    if (hasChanged) {
      await rating.save();
    }

    res.send({
      rating,
    });
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

ratingRoute.delete('/ratings/:id', authentication, requestValidation(deleteRatingRequest), async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) {
      return res.status(404).send({
        error: 'Found no rating!',
      });
    }

    if (rating.userId !== req.user._id.toString()) {
      return res.status(400).send({
        error: 'You can not edit other rating!',
      });
    }

    const course = await Course.findById(rating.courseId);
    if (!course) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }

    let averageRatings = course.averageRatings * course.ratings.length;
    averageRatings -= rating.rating;
    course.ratings = course.ratings.filter((ratingId) => ratingId !== rating._id.toString());
    averageRatings /= course.ratings.length;
    course.averageRatings = averageRatings;
    --course.totalRatings;
    await course.save();

    await rating.delete();

    res.send({
      rating,
    });
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

module.exports = ratingRoute;
