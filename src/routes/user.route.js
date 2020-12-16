const express = require('express');

const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const requestValidation = require('../middlewares/requestValidation.middleware');

const registerRequest = require('../requests/register.request');
const getActivateTokenRequest = require('../requests/getActivateToken.request');
const verifyActivateTokenRequest = require('../requests/verifyActivateToken.request');
const loginNodemyRequest = require('../requests/loginNodemy.request');

const sendWelcome = require('../emails/welcome.email');
const sendActivateToken = require('../emails/sendActivateToken.email');

const userErrors = require('../responses/register.response');

const userRoute = express.Router();

userRoute.post('/users', requestValidation(registerRequest), async (req, res) => {
  try {
    const info = {
      email: req.body.email.toLowerCase(),
      password: req.body.password,
      accountHost: 'Nodemy',
    };
    const user = new User(info);
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

userRoute.post('/users/login-with-nodemy', requestValidation(loginNodemyRequest), async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email.toLowerCase(), req.body.password);
    const refreshToken = await RefreshToken.generateRefreshToken(user);
    const accessToken = await User.generateAccessToken(refreshToken.token);

    res.status(201).send({
      user,
      refreshToken: refreshToken.token,
      accessToken,
    });
  }
  catch (error) {
    res.status(400).send({
      error: error.message,
    });
  }
});

module.exports = userRoute;
