const mongoose = require("mongoose");

const ratingSchema = mongoose.Schema({
  userId: {
    type: String,
    trim: true,
    require: true,
  },
  courseId: {
    type: String,
    trim: true,
    require: true,
  },
  title: {
    type: String,
    trim: true,
    require: true,
  },
  description: {
    type: String,
    trim: true,
    require: true,
  },
  rating: {
    type: Number,
    require: true,
    min: 1,
    max: 5,
  },
});

const Rating = mongoose.model("Rating", ratingSchema);
module.exports = Rating;
