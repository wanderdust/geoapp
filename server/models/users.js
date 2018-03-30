const mongoose = require('mongoose');

let UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  userImage: String,
  phone: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true
  },
  isValidated: {
    type: Boolean
  },
  userStatus: {
    type: String,
    required: false,
    trim: true,
    minlength: 1
  },
  fcmRegId: {
    type: String,
    required: false,
    unique: false
  },
  deviceUuid: {
    type: String,
    required: true,
    unique: true
  }
});

let User = mongoose.model('User', UserSchema);

module.exports = {User};
