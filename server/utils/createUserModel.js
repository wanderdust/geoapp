const {User} = require('./../models/users.js');
const moment = require('moment');

let createUserModel = async function (userCursor, userId) {
  let newModel = {};

  let userModel = await User.findById(userCursor.userId);
  // Names the current user 'Yo' instead of his name.
  if (userCursor.userId === userId) {
    newModel.name = 'Yo'
  } else {
    newModel.name = userModel.name;
  }
  // When the collection gets created updates the timeStamp.
  let timeStamp = userCursor.timeStamp;
  let time = moment(moment(timeStamp).format()).locale('es').fromNow();

  newModel.isOnline = userCursor.online;
  newModel.isPending = userCursor.pending;
  newModel.time = time;
  newModel._id = userModel._id;
  newModel.userStatus = userModel.userStatus;
  userModel.userImage ? newModel.userImage = userModel.userImage : "";

  return newModel;
};

module.exports = {createUserModel};
