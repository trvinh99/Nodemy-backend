const Category = require('../models/category.model');

setInterval(async () => {
  const categories = await Category.find();
  categories.forEach((category) => {
    category.totalRegisteredLastWeek = 0;
    category.save();
  });
}, 604800000); // 7 days in ms...