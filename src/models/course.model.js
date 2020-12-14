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
    min: 0,
  },
  sale: {
    type: Number,
    require: true,
    default: 0,
    min: 0,
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
    default: false,
  },
  isPublic: {
    type: Boolean,
    require: true,
    default: false,
  },
  sections: [
    {
      section: {
        type: String,
        require: true,
      },
    },
  ],
  ratings: [
    {
      rating: {
        type: String,
        require: true,
      },
    },
  ],
});

courseSchema.methods.toJSON = function () {
  const course = this;
  const courseObj = course.toObject();

  delete courseObj.sections;
  delete courseObj.ratings;
  delete courseObj.createAt;
  delete courseObj.__v;

  return courseObj;
};

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
