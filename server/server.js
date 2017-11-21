const {mongoose} = require('./db/mongoose.js')
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {User} = require('./models/users.js');
const {Group} = require('./models/groups.js');
const {UserGroup} = require('./models/user-groups.js');

const publicPath = path.join(__dirname, '../public');
const PORT = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));


io.on('connection', (socket) => {
  socket.on('createGroupCollection', async (userId, callback) => {
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

      groupCollection.push(newModel)
    }
    callback(null, groupCollection)
  });

  socket.on('createUsersCollection', async (groupId, callback) => {
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
  })
})

server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`)
});
