const mongoose = require('mongoose');

const Course = require('./course.model');
const Log = require('./log.model');

const courseSectionSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    trim: true,
    minlength: 24,
    maxlength: 24,
  },
  sectionName: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 200,
  },
  lectures: [{
    lecture: {
      type: String,
      trim: true,
    },
  }],
}, {
  timestamps: true,
});

courseSectionSchema.methods.toJSON = function () {
  const courseSection = this;
  const courseSectionObject = courseSection.toObject();

  delete courseSectionObject.createdAt;
  delete courseSectionObject.updatedAt;
  delete courseSectionObject.__v;

  return courseSectionObject;
};

courseSectionSchema.post('save', async function (section) {
  const { updatedAt, courseId } = section;
  try {
    const course = await Course.findById(courseId);
    course.updatedAt = updatedAt;
    await course.save();
  }
  catch (error) {
    const log = new Log({
      location: 'courseSection.model.js',
      message: error.message,
    });
    await log.save();
  }
});

const CourseSection = mongoose.model('CourseSection', courseSectionSchema);
module.exports = CourseSection;
