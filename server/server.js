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
const {OpenSocketsGroups} = require('./utils/openSocketsGroups.js');
const {OpenSocketsUsers} = require('./utils/openSocketsUsers.js');
const {createGroupModel} = require('./utils/createGroupModel.js');
const {createUserModel} = require('./utils/createUserModel.js');
const {createRequestModel} = require('./utils/createRequestModel.js');

const publicPath = path.join(__dirname, '../public');
const PORT = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

let openSocketsGroups = new OpenSocketsGroups();
let openSocketsUsers = new OpenSocketsUsers();

app.use(express.static(publicPath));

io.on('connection', (socket) => {


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

  socket.on('createUsersCollection', async (data, callback) => {
    try {
      let userCollection = [];
      let userCursors = await UserGroup.find({groupId: data.groupId});

      for (let userCursor of userCursors) {
        // Returns an object with the user model properties.
        let newModel = await createUserModel(userCursor, data.userId);

        userCollection.push(newModel);
      };
      // Sends an array with all the user Models.
      callback(null, userCollection)
    } catch (e) {
      callback(e);
    }
  });

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


  socket.on('userInArea', async (data) => {
    try {
      let updatedDocuments = [];
      // Check if he has been updated already.
      let checkLocation = await UserGroup.findOne({userId: data.userId, groupId: data.groupId});

      if (checkLocation.online)
        return console.log('User location has already been updated')

      // Finds if he is online in another Group and sets it to false.
      let findIfOnlineAndUpdate = await UserGroup.findOneAndUpdate({userId: data.userId, online: true}, {
        $set: {
          online: false
        }
      }, {new: true});

      // Finds if he is pending in another group and sets it to false.
      let findIfPendingAndUpdate = await UserGroup.findOneAndUpdate({userId: data.userId, pending: true}, {
        $set: {
          pending: false
        }
      }, {new: true});

      //Finds the userGroup with the userId and groupId and updates the data in database.
      let updateNewLocation = await UserGroup.findOneAndUpdate({userId: data.userId, groupId: data.groupId}, {
        $set: {
          online: true,
        }
      }, {new: true});

      updatedDocuments.push(findIfOnlineAndUpdate, findIfPendingAndUpdate, updateNewLocation);
      // Return all the models that have been updated.
      // Sends data to respective sockets.
      for (let doc of updatedDocuments) {
        let updatedProperties = {};

        if (doc === null)
          continue;

        let userName = await User.findOne({_id: ObjectID(doc.userId)});

        updatedProperties._id = doc.groupId;
        updatedProperties.userOnline = userName.name;
        updatedProperties.userId = userName._id;

        // Finds the sockets in the  array that contain an updated group.
        let socketsToUpdate = openSocketsGroups.findSockets(doc);

        socketsToUpdate.forEach((e) => {
          io.to(e.socketId).emit('newGroupUpdates', updatedProperties);
        })
      }
    } catch (e) {
      console.log(e)
    }
  });

  // Finds user's selected pending group for the pending view.
  socket.on('findIfPending', async (data, callback) => {
    try {
      let pendingUser = await UserGroup.findOne({userId: data.userId, pending: true});

      if (pendingUser !== null)
          callback(null, pendingUser)

    } catch (e) {
      callback(e)
    }
  });

  socket.on('updatePending', async (data, callback) => {
    try {
      let updatedDocuments = [];
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
      }

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

        if (socketsToUpdate !== undefined)
          io.to(socketsToUpdate[0].socketId).emit('addNewRequest', newRequestModel);
      }

      callback(null, 'Group created succesfully')
    } catch (e) {
      console.log(e, e.message)
      callback(e)
    }
  });

  // Creates a new UserGroup document and removes the request document.
  socket.on('joinGroup', async (data, callback) => {
    try {
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
      let groupName = await Group.findById(newUserGroup.groupId);

      // 2nd We remove the request from db.
      let deletedDocument = await Request.deleteOne({_id: ObjectID(data)});

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
  })

  socket.on('disconnect', () => {
    // Removes from array the groups from the disconnected socket.
    openSocketsGroups.removeSockets(socket);
    openSocketsUsers.removeSockets(socket);
  })
})

server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`)
});
