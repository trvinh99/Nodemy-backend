const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 1,
    maxlength: 50,
  },
  description: {
    type: String,
    default: "",
    trim: true,
    minlength: 1,
    maxlength: 1000,
  },
  parentCategory: {
    type: String,
    trim: true,
    minlength: 24,
    maxlength: 24,
  },
  subCategories: [{
    category: {
      type: String,
      default: "",
      trim: true,
      minlength: 24,
      maxlength: 24,
    },
  }],
  totalCourses: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
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

categorySchema.index({ name: 'text' });

categorySchema.methods.toJSON = function () {
  const category = this;
  const categoryObject = category.toObject();

  delete categoryObject.__v;
  delete categoryObject.createdAt;
  delete categoryObject.updatedAt;

  return categoryObject;
};

categorySchema.statics.updateTotalRegisteredLastWeek = async (categoryId) => {
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return false;
    }

    ++category.totalRegisteredLastWeek;
    await category.save();

    await Category.updateTotalRegisteredLastWeek(category.parentCategory);
  }
  catch { /** ignored */ }
};

categorySchema.index({ name: "text" });

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
