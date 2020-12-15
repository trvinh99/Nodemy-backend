const mongoose = require('mongoose');

const Course = require('./course.model');

const markdownSchema = new mongoose.Schema({
  courseId: {
    type: String,
    trim: true,
    required: true,
  },
  lectureId: {
    type: String,
    trim: true,
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

markdownSchema.methods.toJSON = function () {
  const markdown = this;
  const markdownObject = markdown.toObject();

  delete markdownObject.createdAt;
  delete markdownObject.updatedAt;
  delete markdownObject.__v;

  return markdownObject;
};

markdownSchema.post('save', async function (markdown) {
  const { updatedAt, courseId } = { ...markdown };
  const course = await Course.findById(courseId);
  course.updatedAt = updatedAt;
  await course.save();
});

const Markdown = mongoose.model('Markdown', markdownSchema);
module.exports = Markdown;
