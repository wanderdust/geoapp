const {User} = require('./../models/users.js');
const {Group} = require('./../models/groups.js');
const {UserGroup} = require('./../models/user-groups.js');

let createGroupModel = async function (currentGroupId, currentUserId) {
  let newModel = {};
  let onlineUsersArray = [];
  let pendingUsersArray = [];

  // Finds the current Group in the database.
  let groupModel = await Group.findById(currentGroupId);
  // Finds the online users in the group and loops to add them to an array.
  let onlineUsersInGroup = await UserGroup.find({
    groupId: groupModel._id,
    online: true
  });

  for (let onlineUser of onlineUsersInGroup) {
    let userName = await User.findById(onlineUser.userId);
    if (onlineUser.userId === currentUserId) {
      onlineUsersArray.push('Yo')
    } else {
      onlineUsersArray.push(userName.name);
    }
  };
  // Finds the pending users in the group.
  let pendingUsersInGroup = await UserGroup.find({
    groupId: groupModel._id,
    pending: true
  });

  // Loops through pending users and adds them to an array.
  if (!onlineUsersArray.length) {
    for (let pendingUser of pendingUsersInGroup) {
      let userName = await User.findById(pendingUser.userId);
      if (pendingUser.userId === currentUserId) {
        pendingUsersArray.push('Yo');
      } else {
        pendingUsersArray.push(userName.name)
      }
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
