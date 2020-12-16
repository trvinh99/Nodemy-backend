const express = require('express');
const axios = require('axios');

const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');

const requestValidation = require('../middlewares/requestValidation.middleware');
const authorization = require('../middlewares/authorization.middleware');
const authentication = require('../middlewares/authentication.middleware');

const registerRequest = require('../requests/register.request');
const getActivateTokenRequest = require('../requests/getActivateToken.request');
const verifyActivateTokenRequest = require('../requests/verifyActivateToken.request');
const loginNodemyRequest = require('../requests/loginNodemy.request');
const loginGoogleRequest = require('../requests/loginGoogle.request');

const sendWelcome = require('../emails/welcome.email');
const sendActivateToken = require('../emails/sendActivateToken.email');

const userErrors = require('../responses/register.response');
const downloader = require('../utils/downloader');

const userRoute = express.Router();

userRoute.post('/users', requestValidation(registerRequest), async (req, res) => {
  try {
    const info = {
      email: req.body.email,
      password: req.body.password,
      fullname: req.body.fullname,
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
    res.status(401).send({
      error: 'Unable to login!',
    });
  }
});

userRoute.post('/users/login-with-google', requestValidation(loginGoogleRequest), async (req, res) => {
  try {
    const response = await axios.get('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${req.body.googleAccessToken}`,
      },
    });

    const userInfo = {
      email: response.data.email,
      fullname: response.data.name,
      accountHost: 'Google',
    };

    let user = await User.findOne({ email: userInfo.email });
    if (user && user.accountHost === 'Nodemy') {
      return res.status(401).send({
        error: 'Unable to login!',
      });
    }

    if (!user) {
      const data = await downloader(response.data.picture);
      const avatar = Buffer.from(data, 'base64');
      userInfo.avatar = avatar;
      user = new User(userInfo);
      await user.save();
    }

    const refreshToken = await RefreshToken.generateRefreshToken(user);
    const accessToken = await User.generateAccessToken(refreshToken.token);

    res.status(201).send({
      user,
      refreshToken: refreshToken.token,
      accessToken,
    });
  }
  catch (error) {
    res.status(401).send({
      error: 'Unable to login',
    });
  }
});

userRoute.post('/users/get-access-token', authorization, async (req, res) => {
  try {
    const accessToken = await User.generateAccessToken(req.refreshToken);
    res.status(201).send({
      accessToken,
    });
  }
  catch {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

userRoute.get('/users/me', authentication, (req, res) => {
  try {
    res.send({
      user: req.user,
    });
  }
  catch {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

userRoute.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({
        error: 'Found no user!',
      });
    }

    res.set({ 'Content-Type': 'image' });
    res.end(user.avatar, 'binary');
  }
  catch {
    res.status(404).send({
      error: 'Found no user!',
    });
  }
});

module.exports = userRoute;
