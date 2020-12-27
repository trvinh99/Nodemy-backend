const mongoose = require('mongoose');

const hotCourseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    minlength: 24,
    maxlength: 24,
  },
  totalRegisteredLastWeek: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
}, {
  timestamps: true,
});

const HotCourse = mongoose.model('HotCourse', hotCourseSchema);
module.exports = HotCourse;
