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
    required: true,
    min: 0,
  },
  saleRatio: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
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

courseSchema.methods.packCourseContent = async function (user) {
  const course = this.toJSON();
  try {
    const foundCategoryName = (await Category.findById(course.category)).name;
    course.categoryName = foundCategoryName;
  }
  catch {
    course.categoryName = '';
  }

  const tutorInfo = await User.findById(course.tutor);
  delete course.tutor;
  course.tutor = {
    _id: tutorInfo._id.toString(),
    fullname: tutorInfo.fullname,
    email: tutorInfo.email,
  };

  const last90DaysTimestamp = (new Date()).valueOf() - 7776000000;

  let isNew = false;
  if (last90DaysTimestamp <= (new Date(course.createdAt).valueOf())) {
    isNew = true;
  }
  course.isNew = isNew;

  course.isBought = false;

  let isAdminOrOwner = false;
  if (user && user.accountType === 'Admin') {
    isAdminOrOwner = true;
  }
  else if (user && user._id.toString() === course.tutor) {
    isAdminOrOwner = true;
  }

  if (isAdminOrOwner) {
    course.isBought = true;
  }
  else if (user && Array.isArray(user.boughtCourses) && user.boughtCourses.length !== 0) {
    for (let i = 0; i < user.boughtCourses.length; ++i) {
      if (user.boughtCourses[i].courseId === course._id.toString()) {
        course.isBought = true;
        break;
      }
    }
  }

  course.isHot = false;
  if (course.sale >= 80) {
    course.isHot = true;
  }

  course.isBestseller = false;
  if (course.totalRegistered > 2) {
    course.isBestseller = true;
  }

  return course;
};

courseSchema.statics.getListCourses = async (
  isPublic = true,
  page = 1,
  title = '',
  categoryName = '',
  sort = '',
  user,
  customFields = '',
  customQueries = {},
) => {
  const coursesPerPage = 12;
  const skip = coursesPerPage * (page - 1);

  const selectedFields = `_id title summary tutor price sale category totalRatings createdAt averageRatings ${customFields}`;

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
  let courses = [];
  if (!sort) {
    courses = await Course.find(query)
    .select(selectedFields)
    .skip(skip)
    .limit(coursesPerPage);
  }
  else {
    const sortQuery = {};
    if (sort.includes('ratings')) {
      sortQuery.averageRatings = 'desc';
    }
    if (sort.includes('price')) {
      sortQuery.sale = 'asc';
    }
    courses = await Course.find(query)
    .select(selectedFields)
    .sort(sortQuery)
    .skip(skip)
    .limit(coursesPerPage);
  }

  for (let i = 0; i < courses.length; ++i) {
    courses[i] = await courses[i].packCourseContent(user);
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
