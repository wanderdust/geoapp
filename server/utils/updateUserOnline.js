const {User} = require('./../models/users.js');
const {UserGroup} = require('./../models/user-groups.js');
const {Group} = require('./../models/groups.js');
const {ObjectID} = require('mongodb');
const {sendPushMessages} = require('./sendPushNotification.js');

let updateUserOnline = async function (data, openSocketsGroups, openSocketsUsers, io) {
  try {
    let usersInGroupFCM = [];
    let message;
    let updatedDocuments = [];
    let checkLocation;
    let findIfOnlineAndUpdate;
    let findIfPendingAndUpdate;
    let updateNewLocation;
    let socketsToUpdateUsers = openSocketsUsers.findSockets(data.userId);

    // Check if he has been updated already.
    checkLocation = await UserGroup.findOne({userId: data.userId, groupId: data.groupId, online: true});

    if (checkLocation !== null)
      return;


    // Finds if he is online in another Group and sets it to false.
    findIfOnlineAndUpdate = await UserGroup.findOneAndUpdate({userId: data.userId, online: true}, {
      $set: {
        online: false
      }
    }, {new: true});

    // Finds if he is pending in another group and sets it to false.
    findIfPendingAndUpdate = await UserGroup.findOneAndUpdate({userId: data.userId, pending: true}, {
      $set: {
        pending: false
      }
    }, {new: true});


    //Finds the userGroup with the userId and groupId and updates the data in database.
    updateNewLocation = await UserGroup.findOneAndUpdate({userId: data.userId, groupId: data.groupId}, {
      $set: {
        online: true,
      }
    }, {new: true});


    updatedDocuments.push(findIfOnlineAndUpdate, findIfPendingAndUpdate, updateNewLocation);

    // Return all the models that have been updated.
    // Sends data to respective sockets.
    for (let doc of updatedDocuments) {
      let updatedProperties = {};
      let username;
      let socketsToUpdateGroups;

      if (doc === null)
        continue;

      // Finds out the name of the user who is now online.
      userName = await User.findOne({_id: ObjectID(doc.userId)});

      updatedProperties._id = doc.groupId;
      updatedProperties.userOnline = userName.name;
      updatedProperties.userId = userName._id;

      // Finds the sockets in the  array that contain an updated group.
      socketsToUpdateGroups = openSocketsGroups.findSockets(doc);
      console.log('GroupSockets', socketsToUpdateGroups)
      socketsToUpdateGroups.forEach((e) => {
        io.to(e.socketId).emit('newGroupUpdates', updatedProperties);
      });
    };

    // Sends data to the online/offline users group view.
    socketsToUpdateUsers.forEach((e) => {
      io.to(e.socketId).emit('updateUserStatus', data);
    });

    // We get the group name and the person name to send a
    // personalized notification.
    let usersInGroup = await UserGroup.find({groupId: data.groupId});
    let onlineUser = await User.findById(data.userId);
    let groupName = await Group.findById(data.groupId);

    for (let userInGroup of usersInGroup) {
      // Dont send a notification to the user who actually went online.
      if (userInGroup.userId === data.userId)
        continue;

      let user = await User.findById(userInGroup.userId);
      usersInGroupFCM.push(user.fcmRegId);
    };

    message = {
      title: `GeoApp`,
      body: `${onlineUser.name} ha llegado a ${groupName.title}`
    }



    sendPushMessages(usersInGroupFCM, message);
    console.log('inside the function')
  } catch (e) {
    console.log(e)
  }
};

module.exports = {
  updateUserOnline
}
