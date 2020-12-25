const express = require('express');
const axios = require('axios');
const sharp = require('sharp');
const multer = require('multer');
const randToken = require('rand-token');

const TempUser = require('../models/tempUser.model');
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');

const requestValidation = require('../middlewares/requestValidation.middleware');
const authorization = require('../middlewares/authorization.middleware');
const authentication = require('../middlewares/authentication.middleware');

const registerRequest = require('../requests/user/register.request');
const verifyActivateTokenRequest = require('../requests/user/verifyActivateToken.request');
const loginNodemyRequest = require('../requests/user/loginNodemy.request');
const loginGoogleRequest = require('../requests/user/loginGoogle.request');
const getAvatarRequest = require('../requests/user/getAvatar.request');
const updateNodemyRequest = require('../requests/user/updateNodemy.request');
const updateGoogleRequest = require('../requests/user/updateGoogle.request');

const sendWelcome = require('../emails/welcome.email');
const sendActivateToken = require('../emails/sendActivateToken.email');

const registerError = require('../responses/user/register.response');
const updateError = require('../responses/user/update.response');

const downloader = require('../utils/downloader');
const NodemyResponseError = require('../utils/NodemyResponseError');

const userRoute = express.Router();

// Create new account
userRoute.post('/users', requestValidation(registerRequest), async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      throw new NodemyResponseError(400, 'Email is already exists!');
    }

    const info = {
      email: req.body.email,
      fullname: req.body.fullname,
      activateToken: randToken.generate(6, '0123456789'),
    };
    const tempUser = new TempUser(info);
    await tempUser.save();
    sendActivateToken(info.email, info.activateToken);

    setTimeout(() => {
      try {
        tempUser.delete();
      }
      catch { /** ignored */ }
    }, 660000);

    res.status(201).send({
      user: tempUser,
    });
  }
  catch (error) {
    registerError(res, error);
  }
});

// Confirm email
userRoute.post('/users/:id/verify-activate-token', requestValidation(verifyActivateTokenRequest), async (req, res) => {
  try {
    const user = await TempUser.validateActivateToken(
      req.params.id,
      req.body.token,
      req.body.password,
    );

    sendWelcome(user.email, user.fullname);
    res.status(201).send({ user });
  }
  catch (error) {
    res.status(400).send({
      error: error.message,
    });
  }
});

// Login with Nodemy account
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

// Login with Google account
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
      let avatar = await downloader(response.data.picture);
      avatar = await sharp(avatar).resize({
        width: 150,
        height: 150,
      }).png().toBuffer();
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

// Get access token
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

// Get own profile
userRoute.get('/users/me', authentication, (req, res) => {
  try {
    res.send({ user: req.user });
  }
  catch {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

// Get avatar
userRoute.get('/users/:id/avatar', requestValidation(getAvatarRequest), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({
        error: 'Found no user!',
      });
    }

    res.set({ 'Content-Type': 'image/png' });
    res.end(user.avatar, 'binary');
  }
  catch {
    res.status(404).send({
      error: 'Found no user!',
    });
  }
});

// Logout
userRoute.delete('/users/logout', authorization, async (req, res) => {
  try {
    await RefreshToken.findOneAndDelete({ token: req.refreshToken });
    res.status(204).send();
  }
  catch {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

const avatarUploader = multer({
  limits: {
    fileSize: 10000000, // 10MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload a valid image'));
    }

    cb(undefined, true);
  },
});

userRoute.patch('/users/avatar', authentication, avatarUploader.single('avatar'), async (req, res) => {
  try {
    const buffer = await sharp(req.file.buffer).resize({
      width: 150,
      height: 150,
    }).png().toBuffer();

    req.user.avatar = buffer;
    await req.user.save();

    res.status(200).send({
      user: req.user,
    });
  }
  catch (error) {
    res.status(400).send({
      error: error.message,
    });
  }
});

userRoute.patch('/users/update-with-nodemy/', authentication, requestValidation(updateNodemyRequest), async (req, res) => {
  try {
    let hasChanged = false;

    Object.keys(req.body).forEach((prop) => {
      if (req.user[prop] !== req.body[prop]) {
        hasChanged = true;
        req.user[prop] = req.body[prop];
      }
    });

    if (hasChanged) {
      await req.user.save();
    }

    res.send({
      user: req.user,
    });
  }
  catch (error) {
    updateError(res, error);
  }
});

userRoute.patch('/users/update-with-google', authentication, requestValidation(updateGoogleRequest), async (req, res) => {
  try {
    if (req.body.fullname && req.user.fullname !== req.body.fullname) {
      req.user.fullname = req.body.fullname;
      await req.user.save();
    }

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

userRoute.patch('/users/learning-process', authentication, async (req, res) => {
  try {
    
  }
  catch (error) {

  }
});

module.exports = userRoute;
