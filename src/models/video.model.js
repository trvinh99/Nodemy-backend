const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
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

videoSchema.post('save', async function (lecture) {
  const updatedAt = { ...lecture };
});

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;
