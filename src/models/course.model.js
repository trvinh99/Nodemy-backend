const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
    trim: true,
    unique: true,
  },
  summary: {
    type: String,
    require: true,
    trim: true,
  },
  description: {
    type: String,
    require: true,
    trim: true,
  },
  tutor: {
    type: String,
    require: true,
    trim: true,
  },
  coverImage: {
    type: Buffer,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  sale: {
    type: Number,
    require: true,
    default: 0,
  },
  categories: [
    {
      category: {
        type: String,
        trim: true,
      },
    },
  ],
  isFinish: {
    type: Boolean,
    require: true,
  },
  isPublic: {
    type: Boolean,
    require: true,
  },
  contents: {
    type: String,
    require: true,
  },
  ratings: {
    type: String,
    require: true,
  },
});

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
