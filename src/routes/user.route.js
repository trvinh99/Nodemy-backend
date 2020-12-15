const express = require('express');

const User = require('../models/user.model');
const requestBodyValidation = require('../middlewares/requestBodyValidation.middleware');

const registerRequest = require('../requests/register.request.json');

const userRoute = express.Router();

userRoute.post('/users', requestBodyValidation(registerRequest), async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    res.status(201).send({
      message: '',
    });
  }
  catch (error) {
    
  }
});
