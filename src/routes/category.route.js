const express = require("express");

const authentication = require("../middlewares/authentication.middleware");
const Category = require("../models/category.model");
const requestValidation = require("../middlewares/requestValidation.middleware");
const Log = require('../models/log.model');

const createCategoryRequest = require("../requests/category/createCategory.request");
const updateCategoryRequest = require("../requests/category/updateCategory.request");

const getCategoryRequest = require("../requests/category/getCategory.request");
const rolesValidation = require("../middlewares/rolesValidation.middleware");
const deleteCategoryRequest = require("../requests/category/deleteCategory.request");
const updateCategoryError = require("../responses/category/updateCategory.response");
const createCategoryError = require("../responses/category/createCategory.response");

const categoryRoute = express.Router();

categoryRoute.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.send({ categories });
  }
  catch (error) {
    const log = new Log({
      location: 'Get list category category.route.js',
      message: error.message,
    });
    await log.save();

    res.status(500).send({ error: "Internal Server Error" });
  }
});

categoryRoute.get('/categories/most-registered', async (_, res) => {
  try {
    const categories = await Category.find().sort({ totalRegisteredLastWeek: 'desc' }).limit(5);
    res.send({
      categories,
    });
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

categoryRoute.get("/categories/:id", requestValidation(getCategoryRequest), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).send({ error: "Found no category!" });
    }

    res.send({ category });
  }
  catch (error) {
    const log = new Log({
      location: 'Get category category.route.js',
      message: error.message,
    });
    await log.save();

    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

categoryRoute.post("/categories", authentication, rolesValidation(['Admin']), requestValidation(createCategoryRequest), async (req, res) => {
  try {
    const category = new Category(req.body);

    if (req.body.parentCategory) {
      const parentCategory = await Category.findById(category.parentCategory);
      if (!parentCategory) {
        return res.status(404).send({ error: "Found no parent category!" });
      }
      parentCategory.subCategories.push({ category: category._id.toString() });
      await parentCategory.save();
    }

    await category.save();

    res.status(201).send({ category });
  }
  catch (error) {
    createCategoryError(res, error);
  }
});

categoryRoute.delete("/categories/:id", authentication, rolesValidation(['Admin']), requestValidation(deleteCategoryRequest), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).send({ error: "Found no category" });
    }

    if (category.subCategories.length !== 0) {
      return res.status(400).send({
        error: "Can not delete category has sub categories!",
      });
    }

    if (category.totalCourses > 0) {
      return res.status(400).send({
        error: 'Can not delete category has course(s)!',
      });
    }
    
    const parentCategory = await Category.findById(category.parentCategory);
    if (parentCategory) {
      parentCategory.subCategories = parentCategory.subCategories.filter((subCategory) => 
        subCategory.category !== category._id.toString());
      await parentCategory.save();
    }

    await category.delete();

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
      return res.status(404).send({ error: "Found no category" });
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
        return res.status(404).send({ error: "Found no parent category" });
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
    updateCategoryError(res, error);
  }
});

module.exports = categoryRoute;
