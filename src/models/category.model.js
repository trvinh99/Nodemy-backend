const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  parentCategory: {
    type: String,
    trim: true,
  },
  subCategories: [{
    category: {
      type: String,
      default: "",
      trim: true,
    },
  }],
  totalCourses: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
}, {
  timestamps: true,
});

categorySchema.methods.toJSON = function () {
  const category = this;
  const categoryObject = category.toObject();

  delete categoryObject.__v;
  delete categoryObject.createdAt;
  delete categoryObject.updatedAt;

  return categoryObject;
};

categorySchema.index({ name: "text" });

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
