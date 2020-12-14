const mongoose = require('mongoose');

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
  lectureType: {
    type: String,
    required: true,
    validate(value) {
      if (value !== 'Video' || value !== 'Markdown') {
        throw new Error('Lecture type is invalid!');
      }
    },
  },
  lectureContent: {
    type: String,
    required: true,
    trim: true,
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
  const updatedAt = { ...lecture };
});

const CourseLecture = mongoose.model('CourseLecture', courseLectureSchema);
module.exports = CourseLecture;
