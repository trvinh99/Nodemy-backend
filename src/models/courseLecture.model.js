const mongoose = require('mongoose');

const Course = require('./course.model');
const Log = require('./log.model');

const courseLectureSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    trim: true,
    minlength: 24,
    maxlength: 24,
  },
  sectionId: {
    type: String,
    required: true,
    trim: true,
    minlength: 24,
    maxlength: 24,
  },
  lectureName: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
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

  courseLectureObject.video = `${process.env.HOST}/lectures/${courseLecture._id.toString()}/video`;

  return courseLectureObject;
};

courseLectureSchema.post('save', async function (lecture) {
  const { updatedAt, courseId } = lecture;
  try {
    const course = await Course.findById(courseId);
    course.updatedAt = updatedAt;
    await course.save();
  }
  catch (error) {
    const log = new Log({
      location: 'courseLecture.model.js',
      message: error.message,
    });
    await log.save();
  }
});

const CourseLecture = mongoose.model('CourseLecture', courseLectureSchema);
module.exports = CourseLecture;
