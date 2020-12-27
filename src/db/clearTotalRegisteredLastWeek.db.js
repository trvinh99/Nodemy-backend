const Category = require('../models/category.model');
const HotCourse = require('../models/hotCourse.model');

setInterval(async () => {
  const categories = await Category.find();
  categories.forEach((category) => {
    category.totalRegisteredLastWeek = 0;
    category.save();
  });

  HotCourse.deleteMany();
}, 604800000); // 7 days in ms...