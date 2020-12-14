const mongoose = require('mongoose');

const markdownSchema = new mongoose.Schema({
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

markdownSchema.post('save', async function (lecture) {
  const updatedAt = { ...lecture };
});

const Markdown = mongoose.model('Markdown', markdownSchema);
module.exports = Markdown;
