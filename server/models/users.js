const mongoose = require('mongoose');

let UserSchema = mongoose.Schema({
  name: String,
  userImage: String,
  email: {
    type: String,
    required: false,
    trim: true,
    minlength: 1,
    unique: false
  },
  password: {
    type: String,
    required: false,
    trim: true,
    minlength: 6
  }
});

let User = mongoose.model('User', UserSchema);

module.exports = {User};
