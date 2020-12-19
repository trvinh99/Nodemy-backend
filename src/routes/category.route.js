const express = require("express");

const authentication = require("../middlewares/authentication.middleware");
const Category = require("../models/category.model");
const requestValidation = require("../middlewares/requestValidation.middleware");

const createCategoryRequest = require("../requests/category/createCategory.request");
const updateCategoryRequest = require("../requests/category/updateCategory.request");

const categoryError = require("../responses/category/category.response");

const categoryRoute = express.Router();

categoryRoute.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find({ name: req.query.name });
    res.send({ categories });
  }
  catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
});

categoryRoute.get("/categories/:id", async (req, res) => {
  try {
    if (req.params.id.length !== 24) {
      throw new Error("Format of category id is invalid!");
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).send({ error: "Found no category!" });
    }

    res.send({ category });
  }
  catch (error) {
    res.status(404).send({ error: "Found no category!" });
  }
});

categoryRoute.post("/categories", authentication, requestValidation(createCategoryRequest), async (req, res) => {
  try {
    const category = new Category(req.body);

    const parentCategory = await Category.findById(category.parentCategory);
    if (!parentCategory) {
      res.status(404).send({ error: "Found no parent category!" });
    }
    parentCategory.subCategories.push({ category: category._id.toString() });
    await parentCategory.save();

    await category.save();

    res.status(201).send({ category });
  }
  catch (error) {
    res.status(400).send({
      error: categoryError.createCategoryError(error),
    });
  }
});

categoryRoute.delete("/categories/:id", authentication, async (req, res) => {
  try {
    const categoryId = req.params.id;
    if (categoryId.length !== 24) {
      throw new Error("Format of category id is invalid!");
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(404).send({ error: "Found no category" });
    }

    if (category.subCategories.length !== 0) {
      return res.status(400).send({
        error: "Can not delete category has sub categories",
      });
    }

    if (category.totalCourses > 0) {
      return res.status(400).send({
        error: 'Can not delete category has course(s)',
      });
    }
    
    const parentCategory = await Category.findById(category.parentCategory);
    if (!parentCategory) {
      return res.status(404).send({
        error: `Found no parent category with id ${category.parentCategory}`,
      });
    }
    parentCategory.subCategories = parentCategory.subCategories.filter((subCategory) => 
      subCategory.category !== category._id.toString());

    await category.delete();
    await parentCategory.save();

    res.send({ category });
  }
  catch (error) {
    res.status(400).send({
      error: `Delete failed!`,
    });
  }
});

categoryRoute.patch("/categories/:id", authentication, requestValidation(updateCategoryRequest), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).send({ error: "Found no category" });
    }

    let hasChanged = false;

    if (typeof req.body.name !== 'undefined' && category.name !== req.body.name) {
      hasChanged = true;
      category.name = req.body.name;
    }

    if (typeof req.body.description !== 'undefined' && category.description !== req.body.description) {
      hasChanged = true;
      category.description = req.body.description;
    }

    if (typeof req.body.parentCategory !== 'undefined' && category.parentCategory !== req.body.parentCategory) {
      const parentCategory = await Category.findById(req.body.parentCategory);
      if (!parentCategory) {
        res.status(404).send({ error: "Found no parent category" });
      }

      const oldParentCategory = await Category.findById(category.parentCategory);
      oldParentCategory.subCategories = oldParentCategory.subCategories.filter((subCategory) =>
        subCategory.category !== category._id.toString());
      
      parentCategory.subCategories.push({ category: category._id.toString() });
      hasChanged = true;
      await parentCategory.save();
      await oldParentCategory.save();
    }

    if (hasChanged) {
      await category.save();
    }

    res.send({ category });
  }
  catch (error) {
    res.status(400).send({
      error: categoryError.updateCategoryError(error),
    });
  }
});

module.exports = categoryRoute;
