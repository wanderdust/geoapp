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

const publicPath = path.join(__dirname, '../public');
const PORT = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

let openSockets = [];

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('hi')

  socket.on('createGroupCollection', async (userId, callback) => {
    try {
      let groupCollection = [];
      let groupCursors = await UserGroup.find(userId);

      for (let cursor of groupCursors) {
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

        groupCollection.push(newModel);

        openSockets.push({
          groupId: groupModel._id,
          socketId: socket.id
        });

      }
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
        let newModel = {};

        let userModel = await User.findById(userCursor.userId);

        newModel.name = userModel.name;
        newModel.isOnline = userCursor.online;
        newModel.isPending = userCursor.pending;
        newModel._id = userModel._id;
        userModel.userImage ? newModel.userImage = userModel.userImage : "";

        userCollection.push(newModel);
      };
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
        let requestModel = {};

        let senderModel = await User.findById(requestCursor.senderId);
        let groupModel = await Group.findById(requestCursor.groupId);

        requestModel.title = groupModel.title;
        requestModel.sentBy = senderModel.name;
        groupModel.groupImage ? requestModel.groupImage = groupModel.groupImage : "";

        requestCollection.push(requestModel);
      }
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
      for (let doc of updatedDocuments) {
        if (doc === null)
          continue;

        let updatedProperties = {};

        let userName = await User.findOne({_id: ObjectID(doc.userId)});

        updatedProperties._id = doc.groupId;
        updatedProperties.userOnline = userName.name;

        let socketsToUpdate = openSockets.filter((data) => {
          return data.groupId == doc.groupId;
        })

        socketsToUpdate.forEach((data) => {
          io.to(data.socketId).emit('newGroupUpdates', updatedProperties);
        })
      }
    } catch (e) {
      console.log(e)
    }
  })
})

server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`)
});
