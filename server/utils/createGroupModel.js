const moment = require('moment');
const {User} = require('./../models/users.js');
const {Group} = require('./../models/groups.js');
const {UserGroup} = require('./../models/user-groups.js');

let createGroupModel = async function (currentGroupId, currentUserId) {
  try {
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
    for (let pendingUser of pendingUsersInGroup) {
      let userName = await User.findById(pendingUser.userId);
      if (pendingUser.userId === currentUserId) {
        pendingUsersArray.push('Yo');
      } else {
        pendingUsersArray.push(userName.name)
      }
    }

    if (groupModel.frequence === 'once') {
      newModel.date = moment(groupModel.date).locale('es').format("dddd DD MMMM, hh:mm a");
    } else if (groupModel.frequence === 'weekly') {
      newModel.date = `Los ${moment(groupModel.date).locale('es').format("dddd")} a las ${moment(groupModel.date).locale('es').format("hh:mm a")}`;
    } else if (groupModel.frequence === 'always') {
      newModel.date = `Todos los días`
    }

    newModel.title = groupModel.title;
    newModel.coords = groupModel.coords;
    newModel.activeUsers = onlineUsersArray;
    newModel.pendingUsers =  pendingUsersArray;
    newModel.frequency = groupModel.frequency;
    newModel._id = groupModel._id;
    groupModel.groupImage ? newModel.groupImage = groupModel.groupImage : "";

    return newModel;
  } catch (e) {
    console.log(e);
  }
}

module.exports = {createGroupModel};
