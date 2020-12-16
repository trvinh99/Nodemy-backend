const express = require("express");

const authentication = require("../middlewares/authentication.middleware");
const Category = require("../models/category.model");
const requestValidation = require("../middlewares/requestValidation.middleware");

const createCategoryRequest = require("../requests/category/createCategory.request");
const updateCategoryRequest = require("../requests/category/updateCategory.request");

const categoryRoute = express.Router();

categoryRoute.get("/categories", authentication, async (req, res) => {
  try {
    const categories = await Category.find({ name: req.query.name });
    console.log(categories);
    res.status(200).send(categories);
  } catch (error) {
    res.status(400).send({
      message: `'Get failed!'`,
    });
  }
});

categoryRoute.post(
  "/categories",
  authentication,
  requestValidation(createCategoryRequest),
  async (req, res) => {
    try {
      const categoryReq = req.body;
      console.log(categoryReq);
      const category = new Category(categoryReq);

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
    const categoryId = req.params.id;

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      throw new Error("Category is not exist!");
    }

    res.status(200).send({
      message: `Category ${categoryId} has been deleted`,
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
      const categoryId = req.params.id;
      const update = req.body;

      const category = await Category.findByIdAndUpdate(categoryId, update, {
        upsert: true,
      });
      if (!category) {
        throw new Error("Category is not exist!");
      }

      res.status(200).send({
        message: `Category ${categoryId} has been updated!`,
      });
    } catch (error) {
      res.status(400).send({
        message: `Update failed!`,
      });
    }
  }
);

module.exports = categoryRoute;
