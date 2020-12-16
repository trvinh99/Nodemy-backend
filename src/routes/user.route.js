const express = require('express');

const User = require('../models/user.model');
const requestValidation = require('../middlewares/requestValidation.middleware');

const registerRequest = require('../requests/register.request');
const getActivateTokenRequest = require('../requests/getActivateToken.request');
const verifyActivateTokenRequest = require('../requests/verifyActivateToken.request');

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

userRoute.post('/users/:id/get-activate-token', requestValidation(getActivateTokenRequest), async (req, res) => {
  try {
    const { token, email } = await User.generateActivateToken(req.params.id);
    sendActivateToken(email, token);

    res.status(201).send({
      message: 'Activate token has been created!',
    });
  }
  catch (error) {
    res.status(400).send({
      error: error.message,
    });
  }
});

userRoute.patch('/users/:id/verify-activate-token', requestValidation(verifyActivateTokenRequest), async (req, res) => {
  try {
    await User.validateActivateToken(req.params.id, req.body.token);
    res.send({
      message: 'Account has been verifed!',
    });
  }
  catch (error) {
    res.status(400).send({
      error: error.message,
    });
  }
});

module.exports = userRoute;
