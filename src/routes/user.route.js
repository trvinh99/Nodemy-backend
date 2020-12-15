const express = require('express');

const User = require('../models/user.model');
const requestValidation = require('../middlewares/requestValidation.middleware');

const registerRequest = require('../requests/register.request');

const sendWelcome = require('../emails/welcome.email');
const sendActivateToken = require('../emails/sendActivateToken.email');

const userErrors = require('../responses/register.response');

const userRoute = express.Router();

userRoute.post('/users', requestValidation(registerRequest), async (req, res) => {
  try {
    const user = new User({
      ...req.body,
      accountHost: 'Nodemy',
    });
    await user.save();

    sendWelcome(req.body.email, req.body.fullname);

    res.status(201).send({
      message: `Account ${req.body.email} has been created!`,
    });
  }
  catch (error) {
    res.status(400).send({
      error: userErrors.registerError(error),
    });
  }
});

userRoute.post('/users/:id/activateToken', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({
        message: 'Found no user',
      });
    }

    const token = await user.generateActivateToken();
    sendActivateToken(user.email, token);

    res.status(201).send({
      error: 'Activate token has been created!',
    });
  }
  catch (error) {
    res.status(400).send({
      error: error.message,
    });
  }
});

module.exports = userRoute;
