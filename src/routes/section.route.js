const express = require('express');

const authentication = require('../middlewares/authentication.middleware');
const rolesValidation = require('../middlewares/rolesValidation.middleware');
const Course = require('../models/course.model');

const Section = require('../models/courseSection.model');

const requestValidation = require('../middlewares/requestValidation.middleware');
const createSectionRequest = require('../requests/sections/createSection.request');
const updateSectionRequest = require('../requests/sections/updateSection.request');

const sectionError = require('../responses/section/section.response');
const getSectionsRequest = require('../requests/sections/getSections.request');
const deleteSectionRequest = require('../requests/sections/deleteSection.request');

const sectionRoute = express.Router();

sectionRoute.get('/sections/me/:courseId', authentication, rolesValidation(['Teacher', 'Admin']), requestValidation(getSectionsRequest), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course || course.tutor !== req.user._id.toString()) {
      return res.status(404).send({ error: `Found no course!` });
    }

    const sections = await Section.find({ courseId: req.params.courseId });

    res.send({ sections });
  }
  catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
})

sectionRoute.get('/sections/:courseId', requestValidation(getSectionsRequest), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course || !course.isPublic) {
      return res.status(404).send({ error: `Found no course!` });
    }

    const sections = await Section.find({ courseId: req.params.courseId });

    res.send({ sections });
  }
  catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
})

sectionRoute.post('/sections', authentication, rolesValidation(['Teacher', 'Admin']), requestValidation(createSectionRequest), async (req, res) => {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course || course.tutor !== req.user._id.toString()) {
      return res.status(404).send({ error: `Found no course with id ${req.body.courseId}!` });
    }

    const section = new Section(req.body);

    await section.save();
    res.status(201).send({ section })
  } 
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
})

sectionRoute.delete('/sections/:id', authentication, rolesValidation(['Teacher', 'Admin']), requestValidation(deleteSectionRequest), async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).send({ error: `Found no section!` });
    }

    const course = await Course.findById(section.courseId);
    if (!course || course.tutor !== req.user._id.toString()) {
      return res.status(404).send({ error: `Found no course!` });
    }

    course.sections = course.sections.filter(st => st.section !== section._id.toString());
    await course.save();

    await section.delete();

    res.send({ section });
  }
  catch (error) {
    res.status(400).send({
      error: `Delete failed!`,
    })
  }
})

sectionRoute.patch('/sections/:id', authentication, rolesValidation(['Teacher', 'Admin']), requestValidation(updateSectionRequest), async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).send({ error: `Found no section!` });
    }

    const course = await Course.findById(section.courseId);
    if (!course || course.tutor !== req.user._id.toString()) {
      return res.status(404).send({ error: `Found no course!` });
    }

    let hasChanged = false;

    if (typeof req.body.sectionName !== 'undefined' && section.sectionName !== req.body.sectionName) {
      hasChanged = true;
      section.sectionName = req.body.sectionName;
    }

    if (hasChanged) {
      await section.save();
    }

    res.send({ section })
  }
  catch (error) {
    console.log(error.message)
    res.status(400).send({
      error: sectionError.updateSectionError(error),
    })
  }
})

module.exports = sectionRoute;