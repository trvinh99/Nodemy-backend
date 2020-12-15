const mongoose = require('mongoose');

const Course = require('./category.model');

const courseSectionSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    trim: true,
  },
  sectionName: {
    type: String,
    required: true,
    trim: true,
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
  const course = await Course.findById(courseId);
  course.updatedAt = updatedAt;
  await course.save();
});

const CourseSection = mongoose.model('CourseSection', courseSectionSchema);
module.exports = CourseSection;
