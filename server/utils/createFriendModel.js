const {User} = require('./../models/users.js');

let createFriendModel = async function (friend) {
  let newModel = {};

  let userModel = await User.findById(friend.friendId);

  newModel.name = userModel.name;
  newModel.isOnline = friend.online;
  newModel.isPending = friend.pending;
  newModel._id = userModel._id;
  newModel.userStatus = userModel.userStatus;
  userModel.userImage ? newModel.userImage = userModel.userImage : "";

  return newModel;
};

module.exports = {createFriendModel};
