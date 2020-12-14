const mongoose = require('mongoose');

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
  const updatedAt = { ...section };
});

const CourseSection = mongoose.model('CourseSection', courseSectionSchema);
module.exports = CourseSection;
