const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let secret = 'secret123456';

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
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});


UserSchema.methods.generateAuthToken = async function () {
  let user = this;
  let access = 'auth';
  let token = jwt.sign({_id: user._id.toHexString(), access}, secret);

  user.tokens.push({access, token});

  await user.save();
  return token;
};

UserSchema.methods.removeToken = function (token) {
  let user = this;

  if (user.tokens[0].token !== token)
    return Promise.reject('Tokens are not the same')

  return user.update({
    $pull: {
      tokens: {token}
    }
  })
};




let User = mongoose.model('User', UserSchema);

module.exports = {User};
