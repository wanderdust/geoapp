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
const {OpenSockets} = require('./utils/openSockets.js');
const {createGroupModel} = require('./utils/createGroupModel.js');
const {createUserModel} = require('./utils/createUserModel.js');
const {createRequestModel} = require('./utils/createRequestModel.js');

const publicPath = path.join(__dirname, '../public');
const PORT = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

let openSockets = new OpenSockets();

app.use(express.static(publicPath));

io.on('connection', (socket) => {

  socket.on('createGroupCollection', async (userId, callback) => {
    try {
      let groupCollection = [];
      let groupCursors = await UserGroup.find(userId);

      for (let cursor of groupCursors) {
        // Returns an object with the group model properties.
        let newModel = await createGroupModel(cursor, userId);

        // Adds a new element mapping groupId with socketId.
        openSockets.addSockets(newModel._id, socket.id);
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
        let socketsToUpdate = openSockets.findSockets(doc);

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

        let socketsToUpdate = openSockets.findSockets(doc);

        socketsToUpdate.forEach((e) => {
          io.to(e.socketId).emit('newPendingUpdates', updatedProperties);
        })
      }

      // If operation succesfull tells the model to set button to green.
      callback(null, `Vas a ir a ${groupName.title}`);
    } catch (e) {
      callback(e.message);
    }
  })

  socket.on('disconnect', () => {
    // Removes from array the groups from the disconnected socket.
    openSockets.removeSockets(socket);
  })
})

server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`)
});
