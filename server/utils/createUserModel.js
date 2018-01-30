const {User} = require('./../models/users.js');

let createUserModel = async function (userCursor, userId) {
  let newModel = {};

  let userModel = await User.findById(userCursor.userId);
  // Names the current user 'Yo' instead of his name.
  if (userCursor.userId === userId) {
    newModel.name = 'Yo'
  } else {
    newModel.name = userModel.name;
  }
  newModel.isOnline = userCursor.online;
  newModel.isPending = userCursor.pending;
  newModel._id = userModel._id;
  userModel.userImage ? newModel.userImage = userModel.userImage : "";

  return newModel;
};

module.exports = {createUserModel};
