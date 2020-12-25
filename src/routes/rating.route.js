
const express = require('express');

const authentication = require('../middlewares/authentication.middleware');
const requestValidation = require('../middlewares/requestValidation.middleware');
const createRatingRequest = require('../requests/rating/createRating.request');
const updateRatingRequest = require('../requests/rating/updateRating.request');
const ratingError = require('../responses/rating/rating.response');

const Course = require('../models/course.model');
const Rating = require('../models/rating.models');
const User = require('../models/user.model');

const ratingRoute = express.Router();

ratingRoute.post('/ratings', authentication, async (req, res) => {
    try {
        const course = await Course.findById(req.body.courseId);       
        if (!course) {
            return res.status(404).send({ error: `Found no course!` });
        }

        const rating = new Rating({
            ...req.body,
            userId: req.user._id.toString(),
        });

        await rating.save();

        res.status(201).send({ rating });
    }
    catch (error) {
        res.status(400).send({
            error: ratingError.createRatingError(error)
        })
    }
})

ratingRoute.get('/ratings/:courseId', async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).send({ error: `Found no course!` });
        }
        
        const ratings = await Rating.find({ courseId: req.params.courseId });

        for (let i = 0; i < ratings.length; ++i) {
            ratings[i] = {
                ...ratings[i]._doc,
                userFullname: (await User.findById(ratings[i].userId)).fullname
            }
        }

        res.send({ ratings });
    }
    catch (error) {
        console.log(error.message)
        res.status(500).send({ error: "Internal Server Error"})
    }
})

ratingRoute.delete('/ratings/:ratingId', authentication, async (req, res) => {
    try {
        const rating = await Rating.findById(req.params.ratingId);
        if (!rating) {
            return res.status(404).send({ error: "Found no rating!"})
        }

        await rating.delete();

        res.send({ rating })
    }
    catch (error) {
        res.status(400).send({ error: error.message})
    }
})

ratingRoute.patch('/ratings/:ratingId', authentication, async (req, res) => {
    try {
        const rating = await Rating.findById(req.params.ratingId);
        if (!rating) {
            return res.status(404).send({ error: "Found no rating!"})
        }

        let hasChanged = false;

        if (typeof req.body.title !== 'undefined' && rating.title !== req.body.title) {
            hasChanged = true;
            rating.title = req.body.title;
        }

        if (typeof req.body.description !== 'undefined' && rating.description !== req.body.description) {
            hasChanged = true;
            rating.description = req.body.description;
        }

        if (typeof req.body.rating !== 'undefined' && rating.rating !== req.body.rating) {
            hasChanged = true;
            rating.rating = req.body.rating;
        }

        if (hasChanged) {
            await rating.save();
        }

        res.send({ rating });
    }
    catch (error) {
        res.status(400).send({
            error: ratingError.updateRatingError(error)
        })
    }
})

module.exports = ratingRoute;