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
        let newModel = await createGroupModel(cursor);

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

  socket.on('createUsersCollection', async (groupId, callback) => {
    try {
      let userCollection = [];
      let userCursors = await UserGroup.find(groupId);

      for (let userCursor of userCursors) {
        // Returns an object with the user model properties.
        let newModel = await createUserModel(userCursor);

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
        if (doc === null)
          continue;

        let updatedProperties = {};

        let userName = await User.findOne({_id: ObjectID(doc.userId)});

        updatedProperties._id = doc.groupId;
        updatedProperties.userOnline = userName.name;

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

  socket.on('disconnect', () => {
    // Removes from array the groups from the disconnected socket.
    openSockets.removeSockets(socket);
  })
})

server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`)
});
