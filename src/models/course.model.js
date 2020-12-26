const mongoose = require("mongoose");

const Category = require('./category.model');
const Log = require('./log.model');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
    trim: true,
    minlength: 1,
    maxlength: 60,
  },
  summary: {
    type: String,
    require: true,
    trim: true,
    minlength: 1,
    maxlength: 400,
  },
  description: {
    type: String,
    require: true,
    trim: true,
    minlength: 1,
    maxlength: 1000,
  },
  tutor: {
    type: String,
    require: true,
    trim: true,
    minlength: 24,
    maxlength: 24,
  },
  coverImage: {
    type: Buffer,
    require: true,
  },
  price: {
    type: Number,
    require: true,
    min: 0,
  },
  sale: {
    type: Number,
    default: 0,
    min: 0,
    require: true,
  },
  category: {
    type: String,
    required: true,
    minlength: 24,
    maxlength: 24,
  },
  isFinish: {
    type: Boolean,
    require: true,
    default: false,
  },
  isPublic: {
    type: Boolean,
    require: true,
    default: false,
  },
  sections: [{
    section: {
      type: String,
      require: true,
      minlength: 24,
      maxlength: 24,
    },
  }],
  ratings: [{
    rating: {
      type: String,
      require: true,
      minlength: 24,
      maxlength: 24,
    },
  }],
  totalRegistered: {
    type: Number,
    min: 0,
    default: 0,
    required: true,
  },
  totalViewed: {
    type: Number,
    min: 0,
    default: 0,
    required: true,
  },
});

courseSchema.index({ title: 'text' });

courseSchema.methods.toJSON = function () {
  const course = this;
  const courseObj = course.toObject();

  delete courseObj.coverImage;
  delete courseObj.createAt;
  delete courseObj.__v;

  courseObj.coverImage = `${process.env.HOST}/courses/${course._id.toString()}/cover-image`;

  return courseObj;
};

courseSchema.statics.formatListCoursesWhenSelect = async (courses = []) => {
  for (let i = 0; i < courses.length; ++i) {
    try {
      const foundCategoryName = (await Category.findById(courses[i].category)).name;
      courses[i] = {
        ...courses[i]._doc,
        coverImage: `${process.env.HOST}/courses/${courses[i]._id.toString()}/cover-image`,
        categoryName: foundCategoryName,
      };
    }
    catch (error) {
      courses[i] = {
        ...courses[i]._doc,
        coverImage: `${process.env.HOST}/courses/${courses[i]._id.toString()}/cover-image`,
        categoryName: ''
      };
    }
  }
};

courseSchema.statics.getListCourses = async (isPublic = true, page = 1, title = '', categoryName = '') => {
  const coursesPerPage = 12;
  const skip = coursesPerPage * (page - 1);

  const selectedFields = '_id title summary tutor price sale category isFinish totalRegistered';

  const query = {};
  if (isPublic) {
    query.isPublic = true;
  }

  if (typeof title === 'string' && title.trim().length > 0) {
    query.title = {
      $regex: new RegExp(`${title}`, 'i'),
    };
  }

  if (typeof categoryName === 'string' && categoryName.trim().length > 0) {
    try {
      const categories = await Category.find({ name: { $regex: new RegExp(`${categoryName}`, 'i') } });
      const ids = [];
      categories.forEach((category) => {
        ids.push(`(${category._id.toString()})`);
      });
      query.category = {
        $regex: new RegExp(`${ids.join('|')}`, 'i'),
      };
    }
    catch (error) {
      const log = new Log({
        location: 'course.model.js - line 134',
        message: error.message,
      });
      await log.save();
    }
  }

  const totalCourses = await Course.find(query).countDocuments();
  const courses = await Course.find(query)
  .select(selectedFields)
  .skip(skip)
  .limit(coursesPerPage);

  await Course.formatListCoursesWhenSelect(courses);

  return {
    courses,
    totalCourses,
    totalPages: Math.ceil(totalCourses / coursesPerPage),
  };
};

courseSchema.statics.increaseTotalViewed = async (courseId = '') => {
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return false;
    }

    ++course.totalViewed;
    await course.save();
  }
  catch { /** ignored */ }
};

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
