const {mongoose} = require('./db/mongoose.js')
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const {ObjectID} = require('mongodb');

const {User} = require('./models/users.js');
const {Group} = require('./models/groups.js');
const {UserGroup} = require('./models/user-groups.js');
const {Request} = require('./models/requests.js');
const {Friend} = require('./models/friends.js')
const {OpenSocketsGroups} = require('./utils/openSocketsGroups.js');
const {OpenSocketsUsers} = require('./utils/openSocketsUsers.js');
const {createGroupModel} = require('./utils/createGroupModel.js');
const {createUserModel} = require('./utils/createUserModel.js');
const {createRequestModel} = require('./utils/createRequestModel.js');
const {createFriendRequestModel} = require('./utils/createFriendRequestModel.js');
const {createFriendModel} = require('./utils/createFriendModel.js')

const publicPath = path.join(__dirname, '../public');
const PORT = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

let openSocketsGroups = new OpenSocketsGroups();
let openSocketsUsers = new OpenSocketsUsers();

app.use(express.static(publicPath));

io.on('connection', (socket) => {

  // Creates a new user in the database.
  socket.on('createUser', async (data, callback) => {
    try {
      let user;
      let newUser = {
        name: data.name,
        userImage: "",
        email: data.email,
        password: data.password
      };

      if (data.password !== data.confirmPassword) {
        throw Error ('Passwords do not match');
      }

      user = await new User(newUser).save();

      callback(null, user._id)
    } catch (e) {
      callback(e.message)
    }
  });

  socket.on('loginUser', async (data, callback) => {
    try {
      let user = await User.findOne({name: data.name, password: data.password});

      if (user === null)
        throw Error('No user found');

      callback(null, user._id)
    } catch (e) {
      callback(e.message)
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

  // FInds all the requests for each user.
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
      callback(e);
    }
  });

  // Creates a new friend Request collection
  socket.on('createFriendRequestCollection', async (userId, callback) => {
    try {
      let requestCollection = [];
      let requestCursors = await Friend.find({friendId: userId, status: "pending"});

      for (let requestCursor of requestCursors) {
        // Returns an object with the request model properties
        let requestModel = await createFriendRequestModel(requestCursor);
        requestCollection.push(requestModel);
      }
      // Updates the current openSockets Users array.
      openSocketsUsers.addSockets(userId, socket.id);
      // Sends an array with the friend request Models.
      callback(null, requestCollection);
    } catch (e) {
      callback(e.message)
    }
  });

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

  // Updates user data when he changes location.
  socket.on('userInArea', async (data) => {
    try {
      let updatedDocuments = [];
      let checkLocation;
      let findIfOnlineAndUpdate;
      let findIfPendingAndUpdate;
      let updateNewLocation;
      let socketsToUpdateUsers = openSocketsUsers.findSockets(data.userId);

      // Check if he has been updated already.
      checkLocation = await UserGroup.findOne({userId: data.userId, groupId: data.groupId});

      if (checkLocation.online)
        return false

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
          pending: true
        }
      });

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
        pending: false
      };

      userGroup = await new UserGroup(userGroup).save();
      return callback(null, groupModel)
    } catch (e) {
      console.log(e, e.message)
      callback(e.message)
    }
  });

  // Creates the request in the database.
  socket.on('addGroupRequests', async (data, callback) => {
    try {
      let currentUser = data.currentUser;
      let friends = data.friends;

      for (let friend of friends) {
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
      }

      callback(null, 'Group created succesfully')
    } catch (e) {
      console.log(e, e.message)
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
      };

      await new UserGroup(newUserGroup).save();

      // We find out what is the name of the new Group.
      groupName = await Group.findById(newUserGroup.groupId);

      // 2nd We remove the request from db.
      deletedDocument = await Request.deleteOne({_id: ObjectID(data)});

      callback(null, `Has entrado en ${groupName.title}`)
    } catch (e) {
      console.log(e)
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
      console.log(e.message)
      callback(e)
    }
  });

  socket.on('searchFriends', async (data, callback) => {
    try {
      let searchResults = await User.find({name: {$regex : `(?i).*${data.query}.*`}});
      let searchCollection = [];

      for (let result of searchResults) {
        let model = {};

        model.name = result.name;
        model._id = result._id;
        result.userImage ? model.userImage = result.userImage : "";

        // Doesn't show the current user in the search list
        if (data.userId == model._id)
          continue;

        searchCollection.push(model);

        if (searchCollection.length > 20)
          break;
      };

      callback(null, searchCollection)
    } catch (e) {
      console.log(e)
      callback(e)
    }
  });

  // Creates a pending request to be sent to the friend to accept/reject.
  socket.on('sendFriendRequest', async (data, callback) => {
    try {
      let newFriend;
      let newFriendModel;
      let socketsToUpdate = openSocketsUsers.findSockets(data.recipientId);
      let request = {
        userId: data.senderId,
        friendId: data.recipientId,
        status: 'pending'
      };

      // Check if the user is alreay friends with that user or has sent already an invitation.
      let hasFriend = await Friend.findOne({userId:data.senderId , friendId: data.recipientId, status: 'accepted'});
      let requestSent = await Friend.findOne({userId:data.senderId , friendId: data.recipientId, status: 'pending'})
      if (hasFriend) {
        return callback ('y tu ya sois amigos');
      } else if (requestSent) {
        return callback(null, 'Ya has enviado una petición a este usuario')
      }


      // Adds the request to the database.
      newFriend = await new Friend(request).save();
      newFriendModel = await createFriendRequestModel(newFriend);

      // Sends data to that friend.
      if (socketsToUpdate[0] !== undefined)
        io.to(socketsToUpdate[0].socketId).emit('addNewFriendRequest', newFriendModel);

      // Success message.
      callback(null, 'Invitación enviada con éxito')

    } catch (e) {
      callback(e.message);
    }
  });

  socket.on('addFriend', async (data, callback) => {
    try {
      let addFriendAB;
      let addFriendBA;
      let friendRequest;
      let friendName;

      // 1st we change the friendRequest id to accepted.
      addFriendAB = await Friend.findOneAndUpdate({
        _id: data
      }, {
        $set: {status: "accepted"}
      });

      // 2nd we create a new friendship BA for the other user.
      friendRequest = {
        userId: addFriendAB.friendId,
        friendId: addFriendAB.userId,
        status: 'accepted'
      }
      addFriendBA = await new Friend(friendRequest).save();

      // We find out the name of the added user.
      friendName = await User.findById(addFriendBA.friendId);

      callback(null, `${friendName.name} ha sido añadido a tu lista de amigos`)
    } catch (e) {
      callback('No se ha podido añadir a este usuario')
    }
  })

  socket.on('rejectFriend', async (data, callback) => {
    try {
      let userName;
      let deletedDocument = await Friend.findOneAndRemove({
        _id: ObjectID(data),
        status: "pending"
      });
      userName = await User.findById(deletedDocument.userId);

      callback(null, `Has rechazado a ${userName.name}`)
    } catch (e) {

    }
  })

  socket.on('disconnect', () => {
    // Removes from array the groups from the disconnected socket.
    openSocketsGroups.removeSockets(socket);
    openSocketsUsers.removeSockets(socket);
  })
});


server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`)
});
