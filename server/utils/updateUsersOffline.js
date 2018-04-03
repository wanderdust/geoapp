const {User} = require('./../models/users.js');
const {UserGroup} = require('./../models/user-groups.js');
const {Group} = require('./../models/groups.js');
const {ObjectID} = require('mongodb');
const {sendPushMessages} = require('./sendPushNotification.js');

let updateUsersOffline = async function (data, openSocketsGroups, openSocketsUsers, io) {
  try {
    let socketsToUpdateGroups;
    let socketsToUpdateUsers;

    // Checks if the user is online in any group. If he is continues, if not returns.
    checkLocation = await UserGroup.findOne({userId: data.userId, online: true});


    if (checkLocation === null)
      return

    let  setOffBounds = await UserGroup.findOneAndUpdate({userId: data.userId, online: true}, {
      $set: {
        online: false,
      }
    }, {new: true});

    // Finds out the name of the user who is now online.
    let userName = await User.findOne({_id: ObjectID(data.userId)});

    let groupProperties = {
      _id: setOffBounds.groupId,
      userOnline: userName.name,
      userId: setOffBounds.userId
    };

    socketsToUpdateGroups = openSocketsGroups.findSockets(setOffBounds);

    socketsToUpdateGroups.forEach((e) => {
      io.to(e.socketId).emit('userOffline', groupProperties);
    });

    socketsToUpdateUsers = openSocketsUsers.findSockets(data.userId);

    socketsToUpdateUsers.forEach((e) => {
      io.to(e.socketId).emit('updateUserStatus', data);
    });
  } catch (e) {
    console.log(e)
  }
};

module.exports = {
  updateUsersOffline
}
