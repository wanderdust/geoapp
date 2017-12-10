const {User} = require('./../models/users.js');
const {Group} = require('./../models/groups.js');
const {UserGroup} = require('./../models/user-groups.js');

let createGroupModel = async function (cursor) {
  let newModel = {};
  let onlineUsersArray = [];
  let pendingUsersArray = [];

  let groupModel = await Group.findById(cursor.groupId);
  let onlineUsersInGroup = await UserGroup.find({
    groupId: groupModel._id,
    online: true
  });

  for (let onlineUser of onlineUsersInGroup) {
    let userName = await User.findById(onlineUser.userId);
    onlineUsersArray.push(userName.name)
  };
  let pendingUsersInGroup = await UserGroup.find({
    groupId: groupModel._id,
    pending: true
  });

  if (!onlineUsersArray.length) {
    for (let pendingUser of pendingUsersInGroup) {
      let userName = await User.findById(pendingUser.userId);
      pendingUsersArray.push(userName.name)
    }
  };

  newModel.title = groupModel.title;
  newModel.coords = groupModel.coords;
  newModel.activeUsers = onlineUsersArray;
  newModel.pendingUsers =  pendingUsersArray;
  newModel._id = groupModel._id;
  groupModel.groupImage ? newModel.groupImage = groupModel.groupImage : "";

  return newModel;
}

module.exports = {createGroupModel};
