const mongoose = require('mongoose');

const Course = require('./course.model');

const videoSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    trim: true,
  },
  lectureId: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: Buffer,
    required: true,
  },
}, {
  timestamps: true,
});

videoSchema.methods.toJSON = function () {
  const video = this;
  const videoObject = video.toObject();

  delete videoObject.createdAt;
  delete videoObject.updatedAt;
  delete videoObject.__v;

  return videoObject;
};

videoSchema.post('save', async function (video) {
  const { updatedAt, courseId } = { ...video };
  const course = await Course.findById(courseId);
  course.updatedAt = updatedAt;
  await course.save();
});

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;
