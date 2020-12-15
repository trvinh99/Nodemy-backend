const mongoose = require('mongoose');

const Course = require('./course.model');

const courseLectureSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    trim: true,
  },
  sectionId: {
    type: String,
    required: true,
    trim: true,
  },
  lectureName: {
    type: String,
    required: true,
    trim: true,
  },
  video: {
    type: Buffer,
    required: true,
  },
  canPreview: {
    type: Boolean,
    required: true,
    default: false,
  },
}, {
  timestamps: true,
});

courseLectureSchema.methods.toJSON = function () {
  const courseLecture = this;
  const courseLectureObject = courseLecture.toObject();

  delete courseLectureObject.createdAt;
  delete courseLectureObject.updatedAt;
  delete courseLectureObject.__v;

  return courseLectureObject;
};

courseLectureSchema.post('save', async function (lecture) {
  const { updatedAt, courseId } = { ...lecture };
  const course = await Course.findById(courseId);
  course.updatedAt = updatedAt;
  await course.save();
});

const CourseLecture = mongoose.model('CourseLecture', courseLectureSchema);
module.exports = CourseLecture;
