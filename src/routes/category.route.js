const express = require("express");

const authentication = require("../middlewares/authentication.middleware");
const Category = require("../models/category.model");
const requestValidation = require("../middlewares/requestValidation.middleware");

const createCategoryRequest = require("../requests/createCategory.request");
const updateCategoryRequest = require("../requests/updateCategory.request");

const categoryRoute = express.Router();

categoryRoute.post(
  "/categories",
  authentication,
  requestValidation(createCategoryRequest),
  async (req, res) => {
    try {
      const category = req.body;

      await category.save();

      res.status(201).send({
        message: `Category ${req.body.name} has been created.`,
      });
    } catch (error) {
      res.status(400).send({
        message: `Create failed`,
      });
    }
  }
);

categoryRoute.delete("/categories/:id", authentication, async (req, res) => {
  try {
    const CategoryId = req.params.id;

    const category = Category.findById(CategoryId);
    if (!category) {
      throw new Error("Category is not exist!");
    }

    await Category.deleteOne({ _id: category.id });

    res.status(200).send({
      message: `Category ${CategoryId} has been deleted`,
    });
  } catch (error) {
    res.status(400).send({
      message: `Delete failed!`,
    });
  }
});

categoryRoute.patch(
  "/categories/:id",
  authentication,
  requestValidation(updateCategoryRequest),
  async (req, res) => {
    try {
      const CategoryId = req.params.id;
      const updateCategory = req.body;
      const category = await Category.findOneAndUpdate(
        { _id: CategoryId },
        updateCategory
      );
      if (!category) {
        throw new Error("Category is not exist!");
      }

      res.status(200).send({
        message: `Category ${CategoryId} has been updated!`,
      });
    } catch (error) {
      res.status(400).send({
        message: `Update failed!`,
      });
    }
  }
);

module.exports = categoryRoute;
