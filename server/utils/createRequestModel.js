const {User} = require('./../models/users.js');
const {Group} = require('./../models/groups.js');

let createRequestModel = async function (requestCursor) {
  let requestModel = {};

  let senderModel = await User.findById(requestCursor.senderId);
  let groupModel = await Group.findById(requestCursor.groupId);

  requestModel.title = groupModel.title;
  requestModel.sentBy = senderModel.name;
  groupModel.groupImage ? requestModel.groupImage = groupModel.groupImage : "";

  return requestModel;
};

module.exports = {createRequestModel}
