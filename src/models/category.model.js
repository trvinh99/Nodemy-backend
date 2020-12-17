const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
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
      required: true,
      default: "",
      trim: true,
    },
    subCategories: [
      {
        category: {
          type: String,
          default: "",
          trim: true,
        },
      },
    ],
  }, {
    timestamps: true,
  },
);

categorySchema.methods.toJSON = function () {
  const category = this;
  const categoryObject = category.toObject();

  delete categoryObject.__v;
  delete categoryObject.createdAt;
  delete categoryObject.updatedAt;

  return categoryObject;
};

categorySchema.methods.updateValueObj = function (req) {
  const category = this;
  category.name = req.body.name === undefined ? category.name : req.body.name;
  category.description =
    req.body.description === undefined
      ? category.description
      : req.body.description;
  category.parentCategory =
    req.body.parentCategory === undefined
      ? category.parentCategory
      : req.body.parentCategory;
  category.subCategories =
    req.body.subCategories.length === undefined
      ? category.subCategories
      : req.body.subCategories;
};

categorySchema.index({ name: "text" });

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
