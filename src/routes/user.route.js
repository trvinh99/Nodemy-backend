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
const updateProfileRequest = require('../requests/user/updateProfile.request');

const sendWelcome = require('../emails/welcome.email');
const sendActivateToken = require('../emails/sendActivateToken.email');

const userErrors = require('../responses/register.response');
const downloader = require('../utils/downloader');

const userRoute = express.Router();

userRoute.post('/users', requestValidation(registerRequest), async (req, res) => {
  try {
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
    userErrors.registerError(res, error);
  }
});

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
    res.send({ user: req.user });
  }
  catch {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

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

userRoute.patch('/users/me/avatar', authentication, avatarUploader.single('avatar'), async (req, res) => {
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

userRoute.patch('/users/me', authentication, requestValidation(updateProfileRequest), async (req, res) => {
  try {
  }
  catch {

  }
});

module.exports = userRoute;
