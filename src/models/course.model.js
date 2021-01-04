const mongoose = require("mongoose");

const Category = require('./category.model');
const User = require('./user.model');
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
  totalRatings: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  averageRatings: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  totalRegistered: {
    type: Number,
    min: 0,
    default: 0,
    required: true,
  },
  totalRegisteredLastWeek: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  totalViewed: {
    type: Number,
    min: 0,
    default: 0,
    required: true,
  },
}, {
  timestamps: true,
});

courseSchema.index({ title: 'text' });

courseSchema.methods.toJSON = function () {
  const course = this;
  const courseObj = course.toObject();

  delete courseObj.coverImage;
  delete courseObj.ratings;
  delete courseObj.__v;
  delete courseObj.sections;

  courseObj.coverImage = `${process.env.HOST}/courses/${course._id.toString()}/cover-image`;

  return courseObj;
};

courseSchema.methods.packCourseContent = async function (boughtCourses = [], isAdminOrOwner = false) {
  const course = this.toJSON();
  try {
    const foundCategoryName = (await Category.findById(course.category)).name;
    course.categoryName = foundCategoryName;
  }
  catch {
    course.categoryName = '';
  }

  const user = await User.findById(course.tutor);
  delete course.tutor;
  course.tutor = {
    fullname: user.fullname,
    email: user.email,
  };

  const last90DaysTimestamp = (new Date()).valueOf() - 7776000000;

  let isNew = false;
  if (last90DaysTimestamp <= (new Date(course.createdAt).valueOf())) {
    isNew = true;
  }
  course.isNew = isNew;

  course.isBought = false;
  if (isAdminOrOwner) {
    course.isBought = true;
  }
  else if (Array.isArray(boughtCourses) && boughtCourses.length !== 0) {
    for (let i = 0; i < boughtCourses.length; ++i) {
      if (boughtCourses[i].courseId === course._id.toString()) {
        course.isBought = true;
        break;
      }
    }
  }

  course.isHot = false;
  if (course.totalRegisteredLastWeek > 10) {
    course.isHot = true;
  }

  return course;
};

courseSchema.statics.getListCourses = async (
  isPublic = true,
  page = 1,
  title = '',
  categoryName = '',
  boughtCourses = [],
  isAdminOrOwner = false,
  customFields = '',
  customQueries = {},
) => {
  const coursesPerPage = 12;
  const skip = coursesPerPage * (page - 1);

  const selectedFields = `_id title summary tutor price sale category totalRatings createdAt ${customFields}`;

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
        location: 'course.model.js',
        message: error.message,
      });
      await log.save();
    }
  }

  Object.assign(query, customQueries);

  const totalCourses = await Course.find(query).countDocuments();
  const courses = await Course.find(query)
  .select(selectedFields)
  .skip(skip)
  .limit(coursesPerPage);

  for (let i = 0; i < courses.length; ++i) {
    courses[i] = await courses[i].packCourseContent(boughtCourses, isAdminOrOwner);
  }

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
    return course;
  }
  catch { /** ignored */ }
};

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
