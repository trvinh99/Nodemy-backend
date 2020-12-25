const mongoose = require("mongoose");
const NodemyResponseError = require("../utils/NodemyResponseError");

const ratingSchema = new mongoose.Schema({
  userId: {
    type: String,
    trim: true,
    require: true,
    minlength: 24,
    maxlength: 24,
  },
  courseId: {
    type: String,
    trim: true,
    require: true,
    minlength: 24,
    maxlength: 24,
  },
  title: {
    type: String,
    trim: true,
    require: true,
    minlength: 1,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    require: true,
    minlength: 1,
    maxlength: 500,
  },
  rating: {
    type: Number,
    require: true,
    min: 1,
    max: 5,
    validate(value) {
      if (value !== 1 && value !== 2 && value !== 3 && value !== 4 && value !== 5) {
        throw new NodemyResponseError(400, 'Rating value must be 1, 2, 3, 4 or 5!');
      }
    },
  },
});

const Rating = mongoose.model("Rating", ratingSchema);
module.exports = Rating;
