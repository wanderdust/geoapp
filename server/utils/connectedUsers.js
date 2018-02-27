const {UserGroup} = require('../models/user-groups.js');

let ConnectedUsers = class {
	constructor () {
  	this.connectedUsers = [];
  }

  addUser (userId, socketId) {
    newSocket = {
      userId,
      socketId,
			handshake: "",
			emitHandshake: function () {
				this.handshake = setTimeout(async () => {
					 let foo = await UserGroup.findOneAndUpdate({
						 userId: this.userId,
						 online: true
					 }, {
						 $set: {
							 online: false
						 }
					 }, {new: true});

					 console.log(foo)
				}, 1000);
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
