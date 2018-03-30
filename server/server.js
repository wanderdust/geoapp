const {mongoose} = require('./db/mongoose.js')
const path = require('path');
const http = require('http');
const validator = require('validator');
const express = require('express');
const socketIO = require('socket.io');
const {ObjectID} = require('mongodb');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const multer  = require('multer');

const {User} = require('./models/users.js');
const {Group} = require('./models/groups.js');
const {UserGroup} = require('./models/user-groups.js');
const {Request} = require('./models/requests.js');
const {Friend} = require('./models/friends.js');
const {ConnectedUsers} = require('./utils/connectedUsers.js');
const {OpenSocketsGroups} = require('./utils/openSocketsGroups.js');
const {OpenSocketsUsers} = require('./utils/openSocketsUsers.js');
const {createGroupModel} = require('./utils/createGroupModel.js');
const {createUserModel} = require('./utils/createUserModel.js');
const {createRequestModel} = require('./utils/createRequestModel.js');
const {createFriendRequestModel} = require('./utils/createFriendRequestModel.js');
const {createFriendModel} = require('./utils/createFriendModel.js');
const {sendPushMessages} = require('./utils/sendPushNotification.js');

const publicPath = path.join(__dirname, '../public');
const PORT = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

let openSocketsGroups = new OpenSocketsGroups();
let openSocketsUsers = new OpenSocketsUsers();
let connectedUsers = new ConnectedUsers();

// app.use(express.static(publicPath));

io.on('connection', (socket) => {

  socket.on('debug', (data) => {
    console.log('DEBUG FUNCTION:', data)
  })

  socket.on('connectedClient', (id) => {
    let users = connectedUsers.connectedUsers;
    let found = false;
    // checks if the user exists in the array. If it does it changes the socket.id,
    // if it doesn't exist it add the user to the array.
    for (let user of users) {
      if (user.userId === id) {
        user.takeHandshake();
        user.socketId = socket.id;
        found = true;
        break;
      };
    };
    if (!found) {
      connectedUsers.addUser(id, socket.id);
    }
  })

  // Creates a new user in the database.
  socket.on('createUser', async (data, callback) => {
    try {
      let user;
      let uuid = data.uuid;
      let userPhone = `${data.prefix}${data.phone}`;
      let newUser = {
        name: data.name,
        userImage: "",
        phone: userPhone,
        fcmRegId: "",
        deviceUuid: uuid,
        isValidated: false
      };

      if (data.prefix === "") {
        return callback({Error: 8, Message: 'Introduce el prefijo de tu país'})
      }

      if (data.phone.length < 6) {
      return callback({Error: 7, Message: 'Teléfono no válido'})
     }
     console.log(data.uuid)
      user = await new User(newUser).save();

      callback(null, {_id: user._id, uuid: newUser.deviceUuid});
    } catch (e) {
      let duplicate = 11000;
      let err = e.errors;
      console.log(e)

      if (e.code === duplicate) {
        callback({Error: 4, Message: 'Este teléfono ya está en uso'})
      } else if (typeof(err.name) !== 'undefined' && err.name.$isValidatorError) {
        callback({Error: 2, Message: 'Introduce tu nombre'})
      } else if (typeof(err.email) !== 'undefined' && err.email.$isValidatorError) {
        callback({Error: 3, Message: 'Introduce tu teléfono'})
      }
    };
  });


  // Login user no longer needed because we use device identification.
  // socket.on('loginUser', async (data, callback) => {
  //   try {
  //     let userPhone = `${data.prefix}${data.phone}`;
  //     let user = await User.findOne({phone: userPhone});
  //
  //
  //     if (!data.localStorage && data.prefix === "") {
  //       // only checks the prefix field if the data doesn't come from localStorage
  //       return callback({Error: 8, Message: 'Introduce el prefijo de tu país'})
  //     }
  //
  //     if (user === null)
  //       return callback({Error: 1, Message: 'Teléfono no encontrado'});
  //
  //
  //     let verify = bcrypt.compareSync(data.password, user.password);
  //
  //     if (!verify) {
  //       // if password is incorrect check if localStorage hash is the same as password.
  //       let hash = await User.findOne({phone: data.phone, password: data.password});
  //
  //       if (hash === null)
  //         return callback({Error: 2, Message: 'Contraseña incorrecta'});
  //     }
  //
  //     callback(null, {_id: user._id, uuid: user.deviceUuid})
  //   } catch (e) {
  //     console.log(e)
  //     callback({Error: 99, Message: e})
  //   }
  // });

  // Passwordless login. Will substitue the above one.
  // Uses the users unique identifier as a login.
  socket.on('passwordlessLogin', async (data, callback) => {
    try {
      console.log('Inside passwordLessLogin')
      let uuid = data.uuid;
      let user = await User.findOne({deviceUuid: uuid});

      if (user === null) {
        return callback({Error: 1, Message: 'Usuario no encontrado'});
      }
      console.log('User found')
      callback(null, {_id: user._id, uuid: user.deviceUuid})
    } catch (e) {

    }
  })

  socket.on('updateUserFcmId', async (data) => {
    try {
      let user = await User.findOneAndUpdate({_id: ObjectID(data.userId)}, {
        $set: {
          fcmRegId: data.regId
        }
      }, {new: true});
    } catch (e) {
      console.log(e)
    }
  })

  socket.on('createGroupCollection', async (userId, callback) => {
    try {
      let groupCollection = [];
      let groupCursors = await UserGroup.find(userId);

      for (let currentGroup of groupCursors) {
        // Returns an object with the group model properties.
        let newModel = await createGroupModel(currentGroup.groupId, userId.userId);

        // Adds a new element mapping groupId with socketId.
        openSocketsGroups.addSockets(newModel._id, socket.id);
        groupCollection.push(newModel);
      };

      // Sends an array with all the group Models.
      callback(null, groupCollection);
    } catch (e) {
      console.log('createGroupCollection error', e.message)
      callback(e);
    }
  });

  // Finds all the users belonging to a group
  socket.on('createUsersCollection', async (data, callback) => {
    try {
      let userCollection = [];
      let userCursors = await UserGroup.find({groupId: data.groupId});

      for (let userCursor of userCursors) {
        // Returns an object with the user model properties.
        let newModel = await createUserModel(userCursor, data.userId);

        // Adds a new element mapping groupId with socketId.
        openSocketsUsers.addSockets(newModel._id, socket.id);
        userCollection.push(newModel);
      };
      // Sends an array with all the user Models.
      callback(null, userCollection);
    } catch (e) {
      callback(e);
    }
  });

  // Gets the current user and return the model.
socket.on('getUser', async (data, callback) => {
  try {
    let userModel = {};
    let user = await User.findById(data.userId);

    userModel.name = user.name;
    userModel._id = user._id;
    userModel.userStatus = user.userStatus;
    user.userImage ? userModel.userImage = user.userImage : "";

    callback(null, userModel);

  } catch (e) {
    callback('Unable to fetch user data');
  }
});

  // FInds all the group requests for each user.
  socket.on('createRequestCollection', async (userId, callBack) => {
    try {
      let requestCollection = [];
      let requestCursors = await Request.find({recipientId: userId});

      for (let requestCursor of requestCursors) {
        // Returns an object with the request model properties.
        let requestModel = await createRequestModel(requestCursor);

        requestCollection.push(requestModel);
      }
      // Updates the current openSockets Users array.
      openSocketsUsers.addSockets(userId, socket.id);
      // Sends an array with the request Models.
      callBack(null, requestCollection);
    } catch (e) {
      console.log(e)
      callBack(e);
    }
  });

  // Creates a new friend Request collection
  // socket.on('createFriendRequestCollection', async (userId, callback) => {
  //   try {
  //     let requestCollection = [];
  //     let requestCursors = await Friend.find({friendId: userId, status: "pending"});
  //
  //     for (let requestCursor of requestCursors) {
  //       // Returns an object with the request model properties
  //       let requestModel = await createFriendRequestModel(requestCursor);
  //       requestCollection.push(requestModel);
  //     }
  //     // Updates the current openSockets Users array.
  //     openSocketsUsers.addSockets(userId, socket.id);
  //     // Sends an array with the friend request Models.
  //     callback(null, requestCollection);
  //   } catch (e) {
  //     callback(e.message)
  //   }
  // });

  // FInds all the friends for each user and creates a collection.
  socket.on('createFriendsCollection', async (userId, callback) => {
    try {
      let friendsCollection = [];
      let friends = await Friend.find({userId: userId, status: "accepted"});

      for (let friend of friends) {
        let friendModel = await createFriendModel(friend);
        friendsCollection.push(friendModel);
      }

      callback(null, friendsCollection)
    } catch (e) {
      callback(e.message)
    }
  })

  // Updates user data when he changes location to be ONLINE.
  socket.on('userInArea', async (data) => {
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
    } catch (e) {
      console.log(e)
    }
  });

  socket.on('userOffBounds', async (data) => {
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
      console.log('User disconnected from GROUP')
    } catch (e) {
      console.log(e)
    }

  });

  // Finds user's already selected pending group for the pending view.
  socket.on('findIfPending', async (data, callback) => {
    try {
      let pendingUser = await UserGroup.findOne({userId: data.userId, pending: true});

      if (pendingUser !== null)
          callback(null, pendingUser)

    } catch (e) {
      callback(e)
    }
  });

  // When user clicks on a group, sets that group to pending in the database
  // and unsets other groups that were pending for that user.
  socket.on('updatePending', async (data, callback) => {
    try {
      let updatedDocuments = [];
      let socketsToUpdateUsers = openSocketsUsers.findSockets(data.userId);
      let groupName = await Group.findOne({_id: ObjectID(data.groupId)});

      // Checks if user is already online in that group.
      let userIsOnline = await UserGroup.findOne({
        userId: data.userId,
        groupId: data.groupId,
        online: true
      });
      if (userIsOnline !== null)
        throw Error ('Ya estás online en este grupo');

      // Finds if he is pending in another group and sets to false.
      let oldPending = await UserGroup.findOneAndUpdate({userId: data.userId, pending: true}, {
        $set: {
          pending: false
        }
      });
      // Finds new group and sets pending to true.
      let newPending = await UserGroup.findOneAndUpdate({groupId: data.groupId, userId: data.userId}, {
        $set: {
          pending: true,
          timeStamp: moment().valueOf()
        }
      }, {new: true});

      updatedDocuments.push(oldPending, newPending);

      // Loops trough the updated docs and sends info to the mapsContentView.
      for (let doc of updatedDocuments) {
        let updatedProperties = {};

        if (doc === null)
          continue;

        let userName = await User.findOne({_id: ObjectID(doc.userId)});

        updatedProperties._id = doc.groupId;
        updatedProperties.userName = userName.name;
        updatedProperties.userId = userName._id;

        let socketsToUpdate = openSocketsGroups.findSockets(doc);

        socketsToUpdate.forEach((e) => {
          io.to(e.socketId).emit('newPendingUpdates', updatedProperties);
        })
      };

      // Gets the timeStamp of the last updated Pending status
      data.timeStamp = newPending.timeStamp;
      // Sends the new data to the users view to update the pending status.
      socketsToUpdateUsers.forEach((e) => {
        io.to(e.socketId).emit('updatePendingStatus', data);
      });

      // If operation succesfull tells the model to set button to green.
      callback(null, `Vas a ir a ${groupName.title}`);
    } catch (e) {
      callback(e.message);
    }
  });

  // User cancels that he is going to a group.
  socket.on('cancelPending', async (data, callback) => {
    try {
      let socketsToUpdateUsers;
      let socketsToUpdateGroups;
      let updatedProperties = {};

      let userName = await User.findOne({_id: ObjectID(data.userId)});

      let pendingUser = await UserGroup.findOneAndUpdate({
        userId: data.userId,
        groupId: data.groupId,
        pending: true
      }, {$set: {
          pending: false
        }
      },{new: true});

      socketsToUpdateUsers = openSocketsUsers.findSockets(data.userId);
      socketsToUpdateGroups = openSocketsGroups.findSockets(pendingUser);

      updatedProperties._id = pendingUser.groupId;
      updatedProperties.userName = userName.name;
      updatedProperties.userId = userName._id;

      socketsToUpdateGroups.forEach((e) => {
        io.to(e.socketId).emit('newPendingUpdates', updatedProperties);
      });

      socketsToUpdateUsers.forEach((e) => {
        io.to(e.socketId).emit('updatePendingStatus', data);
      });

      callback(null, true);
    } catch (e) {
      callback({error: 0, message: 'Ha ocurrido un error'})
    }
  });

  // Creates a new group in the database and a new userGroup reference.
  socket.on('addGroup', async (data, callback) => {
    try {

      let groupModel;
      let userGroup;
      let group;

      group = {
        title: data.title,
        groupImage: data.image,
        coords: {
          lat: data.coords.lat,
          lng: data.coords.lng
        }
      };

      groupModel = await new Group(group).save();

      userGroup = {
        groupId: groupModel._id,
        userId: data.currentUser,
        online: false,
        pending: false,
        timeStamp: 0
      };

      userGroup = await new UserGroup(userGroup).save();
      return callback(null, groupModel)
    } catch (e) {
      callback(e.message)
    }
  });

  // Creates the request in the database.
  socket.on('addGroupRequests', async (data, callback) => {
    try {
      // Array of the fmc tokens for the push notifications
      let friendsFMC = [];
      let currentUser = data.currentUser;
      let friends = data.friends;
      let group = await Group.findById(data.groupId);
      let sender = await User.findById(data.currentUser);

      let notificationMsg = {
        title: `GeoApp`,
        body: `${sender.name} te ha invitado ${group.title}.`
      }

      for (let friend of friends) {
        let isExist = await UserGroup.findOne({groupId: data.groupId, userId: friend});
        let requestSent = await Request.findOne({userId:data.senderId , recipientId: friend, groupId: data.groupId});

        // if the user is already in the group or has already been sent an invitation, skips that user.
        if (isExist !== null || requestSent !== null) {
          continue;
        }


        let newRequest;
        let newRequestModel;
        let socketsToUpdate = openSocketsUsers.findSockets(friend);

        let request = {
            senderId: data.currentUser,
            recipientId: friend,
            groupId: data.groupId
          };

        newRequest = await new Request(request).save();
        newRequestModel = await createRequestModel(newRequest);

        if (socketsToUpdate[0] !== undefined)
          io.to(socketsToUpdate[0].socketId).emit('addNewRequest', newRequestModel);

        // Finds the user's token and pushes it to the array.
        let friendFMCToken = await User.findById(friend);
        friendsFMC.push(friendFMCToken.fcmRegId);
      }

      callback(null, 'Group created succesfully');

      sendPushMessages(friendsFMC, notificationMsg);
    } catch (e) {
      console.log(e)
      callback(e.message)
    }
  });

  // Creates a new UserGroup document when user accepts a group-request.
  socket.on('joinGroup', async (data, callback) => {
    try {
      let groupName;
      let deletedDocument;
      // 1st We create a new userGroup.
      let request = await Request.findById(data);
      let newUserGroup = {
        groupId: request.groupId ,
        userId: request.recipientId,
        online: false,
        pending: false,
        timeStamp:0
      };

      await new UserGroup(newUserGroup).save();

      // We find out what is the name of the new Group.
      groupName = await Group.findById(newUserGroup.groupId);

      // 2nd We remove the request from db.
      deletedDocument = await Request.deleteOne({_id: ObjectID(data)});

      callback(null, `Has entrado en ${groupName.title}`)
    } catch (e) {
      callback(e)
    }
  });

  // Finds the request document and deletes it.
  socket.on('rejectGroup', async (data, callback) => {
    try {
      let deletedDocument = await Request.findOneAndRemove({_id: ObjectID(data)});
      let groupName = await Group.findById(deletedDocument.groupId);

      callback(null, `Has rechazado ${groupName.title}`)
    } catch (e) {
      callback(e)
    }
  });

  // Updates friends automatically by searching on the users contacts.
  socket.on('updateFriendsList', async (data, callback) => {
    try {
      let existingPhones = [];
      // First remove existing users from phones array.
      let currentFriends = await Friend.find({userId: data.userId});

      // Finds each user and adds its phone number to the array.
      for (let currentFriend of currentFriends) {
        let userDoc = await User.findById(currentFriend.friendId);
        let friendPhoneNumber = userDoc.phone;

        existingPhones.push(friendPhoneNumber)
      }

      // Find the existing users phones index in the contacts array and remove them.
      for (let existingPhone of existingPhones) {
        let index = data.phoneNumbers.indexOf(existingPhone);

        data.phoneNumbers.splice(index, 1);
      }

      // Loops through all numbers and if one is found in the DB, creates a
      // new friend model.
      for (let phoneNumber of data.phoneNumbers) {
        let existingFriendInDb = await User.findOne({phone: phoneNumber});
        let user = {};

        if (existingFriendInDb !== null) {

          // We create a Friend model both ways. For current user and other user.
          let friendDataA = {
            userId: data.userId ,
            friendId: existingFriendInDb._id,
            status: 'accepted'
          };

          let friendDataB = {
            userId: existingFriendInDb._id ,
            friendId: data.userId,
            status: 'accepted'
          };

          let newFriendA = await new Friend(friendDataA).save();
          let newFriendB = await new Friend(friendDataB).save();

          // Send the new user to append in the view.
          user.name = existingFriendInDb.name;
          existingFriendInDb.userImage ? user.userImage = existingFriendInDb.userImage : "";
          user.userStatus = existingFriendInDb.userStatus;
          user._id = existingFriendInDb._id;

          callback(null, user)
        }
      };

    } catch (e) {
      console.log(e)
    }
  })

  // socket.on('searchFriends', async (data, callback) => {
  //   try {
  //     let searchResults = await User.find({name: {$regex : `(?i).*${data.query}.*`}});
  //     let searchCollection = [];
  //
  //     for (let result of searchResults) {
  //       let model = {};
  //
  //       model.name = result.name;
  //       model._id = result._id;
  //       model.userStatus = result.userStatus;
  //       result.userImage ? model.userImage = result.userImage : "";
  //
  //       // Doesn't show the current user in the search list
  //       if (data.userId == model._id)
  //         continue;
  //
  //       searchCollection.push(model);
  //
  //       if (searchCollection.length > 20)
  //         break;
  //     };
  //
  //     callback(null, searchCollection)
  //   } catch (e) {
  //     callback(e)
  //   }
  // });
  //
  // // Creates a pending request to be sent to the friend to accept/reject.
  // socket.on('sendFriendRequest', async (data, callback) => {
  //   try {
  //     let newFriend;
  //     let newFriendModel;
  //     let socketsToUpdate = openSocketsUsers.findSockets(data.recipientId);
  //     let request = {
  //       userId: data.senderId,
  //       friendId: data.recipientId,
  //       status: 'pending'
  //     };
  //
  //     // Check if the user is alreay friends with that user or has sent already an invitation.
  //     let hasFriend = await Friend.findOne({userId:data.senderId , friendId: data.recipientId, status: 'accepted'});
  //     let requestSent = await Friend.findOne({userId:data.senderId , friendId: data.recipientId, status: 'pending'});
  //     // Check if the other user has already sent an invitation to him.
  //     let invited = await Friend.findOne({friendId: data.senderId, userId: data.recipientId, status: 'pending'});
  //
  //     if (hasFriend) {
  //       return callback ('y tu ya sois amigos');
  //     } else if (requestSent) {
  //       return callback('está pendiente de aceptar tu invitación');
  //     } else if (invited) {
  //       return callback('ya te ha enviado una petición de amistad')
  //     }
  //
  //
  //     // Adds the request to the database.
  //     newFriend = await new Friend(request).save();
  //     newFriendModel = await createFriendRequestModel(newFriend);
  //
  //     // Sends data to that friend.
  //     if (socketsToUpdate[0] !== undefined)
  //       io.to(socketsToUpdate[0].socketId).emit('addNewFriendRequest', newFriendModel);
  //
  //     // Success message.
  //     callback(null, 'Invitación enviada con éxito')
  //
  //   } catch (e) {
  //     callback(e.message);
  //   }
  // });

  // socket.on('addFriend', async (data, callback) => {
  //   try {
  //     let addFriendAB;
  //     let addFriendBA;
  //     let friendRequest;
  //     let friendName;
  //
  //     // 1st we change the friendRequest id to accepted.
  //     addFriendAB = await Friend.findOneAndUpdate({
  //       _id: data
  //     }, {
  //       $set: {status: "accepted"}
  //     });
  //
  //     // 2nd we create a new friendship BA for the other user.
  //     friendRequest = {
  //       userId: addFriendAB.friendId,
  //       friendId: addFriendAB.userId,
  //       status: 'accepted'
  //     }
  //     addFriendBA = await new Friend(friendRequest).save();
  //
  //     // We find out the name of the added user.
  //     friendName = await User.findById(addFriendBA.friendId);
  //
  //     callback(null, `${friendName.name} ha sido añadido a tu lista de amigos`)
  //   } catch (e) {
  //     callback('No se ha podido añadir a este usuario')
  //   }
  // });
  //
  // // Rejects friend invitation
  // socket.on('rejectFriend', async (data, callback) => {
  //   try {
  //     let userName;
  //     let deletedDocument = await Friend.findOneAndRemove({
  //       _id: ObjectID(data),
  //       status: "pending"
  //     });
  //     userName = await User.findById(deletedDocument.userId);
  //
  //     callback(null, `Has rechazado a ${userName.name}`)
  //   } catch (e) {
  //     callback('No se ha podido completar la operación')
  //   }
  // });

  // Deletes user from the Group.
  socket.on('exitGroup', async (data, callback) => {
    try {
      let socketsToUpdateGroups;
      let deletedUserGroup = await UserGroup.findOneAndRemove({
        groupId: data.groupId,
        userId: data.userId
      });
      // Finds out the name of the user who is now online.
      let userName = await User.findOne({_id: ObjectID(data.userId)});

      let groupProperties = {
        _id: data.groupId,
        userOnline: userName.name,
        userId: data.userId
      };

      // We update the sockets to set the users in the views as offline.
      // They will permanently get removed after a refresh.
      socketsToUpdateGroups = openSocketsGroups.findSockets({groupId: data.groupId});

      socketsToUpdateGroups.forEach((e) => {
        io.to(e.socketId).emit('userOffBounds', groupProperties);
      });

      socketsToUpdateUsers = openSocketsUsers.findSockets(data.userId);

      socketsToUpdateUsers.forEach((e) => {
        io.to(e.socketId).emit('updateUserStatus', data);
      });

      callback(null, true);
    } catch (e) {
      console.log(e)
      callback('No se ha podido completar la operación')
    }
  });

  // Saves the profile data changed by the user.
  socket.on('saveProfileSettings', async(data, callback) => {
    try {
      let updatedDocuments = [];
      let oldName = await User.findOne({_id: ObjectID(data.userId)});
      let user = await User.findOneAndUpdate({_id: data.userId}, {
        $set: {
          userImage: data.userImage,
          name: data.userName,
          userStatus: data.userStatus
        }
      }, {new: true});

      // Finds if he is online in a Group.
      let findIfOnline = await UserGroup.findOne({userId: data.userId, online: true});

      // Finds if he is pending in a group.
      let findIfPenging = await UserGroup.findOne({userId: data.userId, pending: true});

      updatedDocuments.push(findIfOnline, findIfPenging);
      // Return all the models that need updated.
      // Sends data to respective sockets.
      for (let doc of updatedDocuments) {
        let updatedProperties = {};
        let socketsToUpdateGroups;

        if (doc === null)
          continue;

        updatedProperties._id = doc.groupId;
        updatedProperties.oldUserName = oldName.name;
        updatedProperties.userOnline = user.name;
        updatedProperties.userId = user._id;

        // Finds the sockets in the  array that contain an updated group.
        socketsToUpdateGroups = openSocketsGroups.findSockets(doc);

        socketsToUpdateGroups.forEach((e) => {
          io.to(e.socketId).emit('userNameUpdate', updatedProperties);
        });
      };

      callback(null, user);
    } catch (e) {
      console.log(e);
      callback('Unable to save data')
    }
  });

  // // Changes the user's email
  // // Now we use a phone number. Deleting it for now.
  // socket.on('changeEmail', async(data, callback) => {
  //   try {
  //     // let email = validator.isEmail(data.newEmail);
  //
  //     // Verifies that the email format is valid
  //     if (!email)
  //       return callback({Error: 1, Message: 'Email no válido'});
  //
  //     let user = await User.findOne({_id: data._id});
  //
  //     let verify = bcrypt.compareSync(data.password, user.password);
  //
  //     if (user === null || !verify)
  //       return callback({Error: 0, Message: 'Contraseña incorrecta'});
  //
  //     await User.findOneAndUpdate({_id: data._id}, {
  //       $set: {
  //         email: data.newEmail
  //       }
  //     }, {new: true});
  //
  //     callback(null, data.newEmail)
  //   } catch (e) {
  //     callback({Error: 99, Message: 'Ha ocurrido un error'})
  //   }
  // });

  // socket.on('changePassword', async(data, callback) => {
  //   try {
  //     let salt = bcrypt.genSaltSync(10);
  //     let hash = bcrypt.hashSync(data.newPassword, salt);
  //     let user = await User.findOne({_id: data._id});
  //
  //
  //     let verify = bcrypt.compareSync(data.password, user.password);
  //
  //     if (user === null || !verify)
  //       return callback({Error: 0, Message: 'Contraseña incorrecta'});
  //
  //       await User.findOneAndUpdate({_id: data._id}, {
  //         $set: {
  //           password: hash
  //         }
  //       }, {new: true});
  //
  //     callback(null, hash)
  //   } catch (e) {
  //     callback({Error: 99, Message: 'Ha ocurrido un error'})
  //   }
  // })

  // Deletes user's account.
  socket.on('deleteAccount', async(data, callback) => {
    try {
      let phone = `${data.prefix}${data.phone}`;
      console.log(data, phone)
      // For now as long as they verify phone number is okay.
      let user = await User.findOne({_id: data._id, deviceUuid: data.uuid, phone: phone});

      if (user === null) {
        return callback({Error: 0, Message: "No se ha podido eliminar tu cuenta."})
      }

      let delete1 = await Friend.deleteOne({userId: data._id});
      let delete2 = await Friend.deleteOne({friendId: data._id});

      let delete3 = await Request.deleteOne({recipientId: data._id});
      let delete4 = await Request.deleteOne({senderId: data._id});

      let delete5 = await UserGroup.deleteOne({userId: data._id});

      let delete6 = await User.deleteOne({_id: ObjectID(data._id)});

      callback(null, true)

    } catch (e) {
      callback({Error: 99, Message: 'Ha ocurrido un error'})
    }
  });

  socket.on('disconnect', () => {
    // Finds the user that disconnected and starts handshake to check if he is still online.
    let disconnectedUser = connectedUsers.findUser(socket.id);

    if (typeof(disconnectedUser) !== 'undefined') {
      let userId = disconnectedUser.userId;
      let users = connectedUsers.connectedUsers;

      // Finds the users to update and updates.
      for (let user of users) {
        try {
          if (user.userId === userId) {
            user.emitHandshake().then(async (data) => {
              // If data is false it means the user wasnt online in any groups,
              // therefore there is nothing to update.
              if (data) {
                let updatedProperties = {};
                let socketsToUpdateUsers = openSocketsUsers.findSockets(data.userId);
                let socketsToUpdateGroups = openSocketsGroups.findSockets(data);
                let userName = await User.findOne({_id: ObjectID(data.userId)});
                updatedProperties._id = data.groupId;
                updatedProperties.userOnline = userName.name;
                updatedProperties.userId = data.userId;

                socketsToUpdateUsers.forEach((e) => {
                  io.to(e.socketId).emit('updateUserStatus', data);
                });

                socketsToUpdateGroups.forEach((e) => {
                  io.to(e.socketId).emit('newGroupUpdates', updatedProperties);
                });
              }
              connectedUsers.removeSockets(socket);
            }).catch((e) => console.log(e));
          }
        } catch (e) {
          console.log(e)
        }
      }
    }

    // Removes from array the groups from the disconnected socket.
    openSocketsGroups.removeSockets(socket);
    openSocketsUsers.removeSockets(socket);
  })
});


server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
