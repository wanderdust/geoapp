const {User} = require('./../models/users.js');
const {Group} = require('./../models/groups.js');

let createFriendRequestModel = async function (requestCursor) {
  try {
    let requestModel = {};

    let senderModel = await User.findById(requestCursor.userId);
    let recipientModel = await User.findById(requestCursor.friendId);

    requestModel.title = senderModel.name;
    requestModel.sentBy = senderModel.name;
    requestModel._id = requestCursor._id;
    requestModel.userStatus = senderModel.userStatus;
    senderModel.userImage ? requestModel.groupImage = senderModel.userImage : "";

    return requestModel;
  } catch (e) {
    return console.log(e)
  }
};

module.exports = {createFriendRequestModel}
