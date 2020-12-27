const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

const Log = mongoose.model('Log', logSchema);
module.exports = Log;
