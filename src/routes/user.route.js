const express = require('express');
const axios = require('axios');
const sharp = require('sharp');
const multer = require('multer');
const randToken = require('rand-token');
const bcrypt = require('bcrypt');

const Log = require('../models/log.model');
const TempUser = require('../models/tempUser.model');
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const CourseLecture = require('../models/courseLecture.model');
const Course = require('../models/course.model');

const requestValidation = require('../middlewares/requestValidation.middleware');
const authorization = require('../middlewares/authorization.middleware');
const authentication = require('../middlewares/authentication.middleware');
const rolesValidation = require('../middlewares/rolesValidation.middleware');

const registerRequest = require('../requests/user/register.request');
const verifyActivateTokenRequest = require('../requests/user/verifyActivateToken.request');
const loginNodemyRequest = require('../requests/user/loginNodemy.request');
const loginGoogleRequest = require('../requests/user/loginGoogle.request');
const getAvatarRequest = require('../requests/user/getAvatar.request');
const updateNodemyRequest = require('../requests/user/updateNodemy.request');
const updateGoogleRequest = require('../requests/user/updateGoogle.request');
const wishlistRequest = require('../requests/user/wishlist.request');
const updateLearningProcessRequest = require('../requests/user/updateLearningProcess.request');
const verifyUserId = require('../requests/user/verifyUserId.request');

const sendWelcome = require('../emails/welcome.email');
const sendActivateToken = require('../emails/sendActivateToken.email');

const updateError = require('../responses/user/update.response');
const registerError = require('../responses/user/register.response');

const downloader = require('../utils/downloader');
const getUsersRequest = require('../requests/user/getUsers.request');

const userRoute = express.Router();

// Create new account
userRoute.post('/users', requestValidation(registerRequest), async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).send({
        error: 'Email is already exists!',
      });
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
    }, 300000); // 5 minutes

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
    if (user.isBanned) {
      return res.status(401).send({
        error: 'Unable to login!',
      });
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
    else if (user.isBanned) {
      return res.status(401).send({
        error: 'Unable to login!',
      });
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
      error: 'Unable to login!',
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

    if (req.body.currentPassword && req.body.password) {
      const isMatch = await bcrypt.compare(req.body.currentPassword, req.user.password);
      if (!isMatch) {
        return res.status(400).send({
          error: 'Old password does not match!',
        });
      }
    }

    Object.keys(req.body).forEach((prop) => {
      if (req.user[prop] !== req.body[prop] && prop !== 'currentPassword') {
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

userRoute.patch('/users/learning-process', authentication, requestValidation(updateLearningProcessRequest), async (req, res) => {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }
    if (req.user.accountType === 'Admin' || course.tutor === req.user._id.toString()) {
      return res.status(204).send();
    }

    let courseId = '';
    let foundIndex = -1;
    for (let i = 0; i < req.user.boughtCourses.length; ++i) {
      if (req.user.boughtCourses[i].courseId === req.body.courseId) {
        courseId = req.body.courseId;
        foundIndex = i;
        break;
      }
    }

    if (!courseId) {
      return res.status(400).send({
        error: 'You have not bought this course yet!',
      });
    }

    const lecture = await CourseLecture.findById(req.body.lectureId);
    if (!lecture || lecture.courseId !== courseId) {
      return res.status(404).send({
        error: 'Found no lecture!',
      });
    }

    req.user.boughtCourses[foundIndex].lectureId = req.body.lectureId;
    await req.user.save();

    res.send({
      user: req.user,
    });
  }
  catch (error) {
    const log = new Log({
      location: 'Update learning process user.model.js',
      message: error.message,
    });
    await log.save();

    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

userRoute.patch('/users/add-course-to-wishlist', authentication, requestValidation(wishlistRequest), async (req, res) => {
  try {
    for (let i = 0; i < req.user.wishlist.length; ++i) {
      if (req.user.wishlist[i].courseId === req.body.courseId) {
        return res.status(204).send();
      }
    }

    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }

    req.user.wishlist = [...req.user.wishlist, { courseId: req.body.courseId }];
    await req.user.save();

    res.send({
      user: req.user
    });
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

userRoute.patch('/users/remove-course-from-wishlist', authentication, requestValidation(wishlistRequest), async (req, res) => {
  try {
    req.user.wishlist = req.user.wishlist.filter((course) => course.courseId !== req.body.courseId);
    await req.user.save();

    res.send({
      user: req.user,
    });
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

userRoute.get('/users/wishlist', authentication, async (req, res) => {
  try {
    const courses = [];

    for (let i = 0; i < req.user.wishlist.length; ++i) {
      try {
        let course = await Course.findById(req.user.wishlist[i].courseId).select('_id title summary tutor price sale category totalRatings createdAt averageRatings');
        course = await course.packCourseContent(req.user);
        courses.push(course);
      }
      catch { /** ignored */ }
    }

    res.send({
      courses,
    });
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

userRoute.patch('/users/add-course-to-cart', authentication, requestValidation(wishlistRequest), async (req, res) => {
  try {
    for (let i = 0; i < req.user.cart.length; ++i) {
      if (req.user.cart[i].courseId === req.body.courseId) {
        return res.status(204).send();
      }
    }

    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res.status(404).send({
        error: 'Found no course!',
      });
    }

    req.user.cart = [...req.user.cart, { courseId: req.body.courseId }];
    await req.user.save();

    res.send({
      user: req.user
    });
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

userRoute.patch('/users/remove-course-from-cart', authentication, requestValidation(wishlistRequest), async (req, res) => {
  try {
    req.user.cart = req.user.cart.filter((course) => course.courseId !== req.body.courseId);
    await req.user.save();

    res.send({
      user: req.user,
    });
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

userRoute.get('/users/cart', authentication, async (req, res) => {
  try {
    const courses = [];

    for (let i = 0; i < req.user.cart.length; ++i) {
      try {
        let course = await Course.findById(req.user.cart[i].courseId).select('_id title summary tutor price sale category totalRatings createdAt averageRatings');
        course = await course.packCourseContent(req.user);
        courses.push(course);
      }
      catch { /** ignored */ }
    }

    res.send({
      courses,
    });
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

userRoute.get('/users/bought', authentication, async (req, res) => {
  try {
    const courses = [];

    for (let i = 0; i < req.user.boughtCourses.length; ++i) {
      try {
        let course = await Course.findById(req.user.boughtCourses[i].courseId).select('_id title summary tutor price sale category totalRatings createdAt updatedAt averageRatings');
        course = await course.packCourseContent(req.user);
        courses.push(course);
      }
      catch { /** ignored */ }
    }

    res.send({
      courses,
    })
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

userRoute.patch('/users/ban', authentication, rolesValidation(['Admin']), requestValidation(verifyUserId), async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).send({
        error: 'Found no user!',
      });
    }

    if (!user.isBanned) {
      user.isBanned = true;
      await user.save();
    }

    res.status(204).send();
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

userRoute.patch('/users/unban', authentication, rolesValidation(['Admin']), requestValidation(verifyUserId), async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).send({
        error: 'Found no user!',
      });
    }

    if (user.isBanned) {
      user.isBanned = false;
      await user.save();
    }

    res.status(204).send();
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

userRoute.patch('/users/become-teacher', authentication, rolesValidation(['Admin']), requestValidation(verifyUserId), async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).send({
        error: 'Found no user!',
      });
    }

    if (user.accountType === 'Student') {
      user.accountType = 'Teacher';
      await user.save();
    }

    res.status(204).send();
  }
  catch (error) {
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
});

userRoute.get('/users', authentication, rolesValidation(['Admin']), requestValidation(getUsersRequest), async (req, res) => {
  try {
    const usersPerPage = 24;
    const page = parseInt(req.query.page) || 1;
    const skip = usersPerPage * (page - 1)

    const email = req.query.email || '';
    const query = {
      email: {
        $regex: new RegExp(`${email}`, 'i'),
      },
    };

    const totalUsers = await User.find(query).countDocuments();

    const users = await User.find(query)
    .select('_id email fullname createdAt updatedAt accountType accountHost isBanned')
    .skip(skip)
    .limit(usersPerPage);

    res.send({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / usersPerPage),
    })
  }
  catch (error) {
    res.status(400).send({
      error: error.message,
    });
  }
});

module.exports = userRoute;
