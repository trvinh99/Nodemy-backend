const mongoose = require("mongoose");

const User = require('../models/user.model');

const ratingSchema = mongoose.Schema({
  userId: {
    type: String,
    trim: true,
    require: true,
  },
  courseId: {
    type: String,
    trim: true,
    require: true,
  },
  title: {
    type: String,
    trim: true,
    require: true,
  },
  description: {
    type: String,
    trim: true,
    require: true,
  },
  rating: {
    type: Number,
    require: true,
    min: 1,
    max: 5,
  },
});

ratingSchema.statics.getListRatings = async (page = 1, courseId) => {
  const ratingsPerPage = 10;
  const skip = ratingsPerPage * (page - 1);

  const selectedFields = "_id userId courseId title description rating";
  const query = {
    courseId
  }

  const totalRatings = await Rating.find(query).countDocuments();
  const ratings = await Rating.find(query)
  .select(selectedFields)
  .skip(skip)
  .limit(ratingsPerPage);
  
  for (let i = 0; i < ratings.length; ++i) {
    ratings[i] = {
      ...ratings[i]._doc,
      userFullname: (await User.findById(ratings[i].userId)).fullname
    }
  }

  return {
    ratings,
    totalRatings,
    totalsPage: Math.ceil(totalRatings / ratingsPerPage)
  }

}

const Rating = mongoose.model("Rating", ratingSchema);
module.exports = Rating;
