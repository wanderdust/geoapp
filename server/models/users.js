const mongoose = require('mongoose');

let UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  userImage: String,
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6
  },
  userStatus: {
    type: String,
    required: false,
    trim: true,
    minlength: 1
  }
});

let User = mongoose.model('User', UserSchema);

module.exports = {User};
