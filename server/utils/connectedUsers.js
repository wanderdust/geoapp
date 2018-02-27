const {UserGroup} = require('../models/user-groups.js');

let ConnectedUsers = class {
	constructor () {
  	this.connectedUsers = [];
  }

  addUser (userId, socketId) {
    let newSocket = {
      userId,
      socketId,
			handshake: "",
			emitHandshake: function () {
				let promise = new Promise((resolve, reject) => {
					this.handshake = setTimeout( async () => {
						let data = {};
						 let userGroup = await UserGroup.findOneAndUpdate({
							 userId: this.userId,
							 online: true
						 }, {
							 $set: {
								 online: false
							 }
						 }, {new: true});

						 if (userGroup !== null) {
							 data.userId = userGroup.userId;
							 data.groupId = userGroup.groupId;
						 }

						 resolve(data)
					}, 1000);
				});
				// returns the promise with the data to update other sockets.
				return promise

			},
			takeHandshake: function () {
				clearTimeout(this.handshake);
			}
    };

  	this.connectedUsers.push(newSocket);
    return newSocket;
  }

  findUser (socket) {
  	let user =  this.connectedUsers.filter((data) => {
    	return data.socketId == socket;
    });
    return user[0];
  }

  removeSockets (socket) {
  // Returns an array without the disconnected user.
  	let updatedArray = this.connectedUsers.filter((data) => {
      return data.socketId != socket.id;
    });
   	return this.connectedUsers = updatedArray;
  }
};

module.exports = {ConnectedUsers}
