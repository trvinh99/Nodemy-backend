const mongoose = require("mongoose");

const Category = require('./category.model');

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
    },
  }],
  ratings: [{
    rating: {
      type: String,
      require: true,
    },
  }],
  totalRegistered: {
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

courseSchema.statics.getListCourses = async (isPublic = true, page = 1, title, categoryName) => {
  const coursesPerPage = 12;
  const skip = coursesPerPage * (page - 1);

  const selectedFields = '_id title summary tutor price sale category isFinish totalRegistered';

  const query = {
    isPublic,
  };

  if (title) {
    query.title = {
      $regex: new RegExp(`${title}`, 'i'),
    };
  }

  if (categoryName) {
    const categories = await Category.find({ name: { $regex: new RegExp(`${categoryName}`, 'i') } });
    const rawNames = []
    categories.forEach((category) => {
      rawNames.push(`(${category._id.toString()})`);
    });
    query.category = {
      $regex: new RegExp(`${rawNames.join('|')}`, 'i'),
    };
  }

  const totalCourses = await Course.find(query).countDocuments();
  const courses = await Course.find(query)
  .select(selectedFields)
  .skip(skip)
  .limit(coursesPerPage);

  for (let i = 0; i < courses.length; ++i) {
    const foundCategoryName = (await Category.findById(courses[i].category)).name;
    courses[i] = {
      ...courses[i]._doc,
      coverImage: `${process.env.HOST}/courses/${courses[i]._id.toString()}/cover-image`,
      categoryName: foundCategoryName,
    };
  }

  return {
    courses,
    totalCourses,
    totalPages: Math.ceil(totalCourses / coursesPerPage),
  };
};

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
