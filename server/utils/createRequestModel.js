const {User} = require('./../models/users.js');
const {Group} = require('./../models/groups.js');

let createRequestModel = async function (requestCursor) {
  try {
    let requestModel = {};

    let senderModel = await User.findById(requestCursor.senderId);
    let groupModel = await Group.findById(requestCursor.groupId);

    requestModel.title = groupModel.title;
    requestModel.sentBy = senderModel.name;
    requestModel._id = requestCursor._id,
    groupModel.groupImage ? requestModel.groupImage = groupModel.groupImage : "";

    return requestModel;
  } catch (e) {
    return console.log(e)
  }
};

module.exports = {createRequestModel}
