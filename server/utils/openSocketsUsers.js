let OpenSocketsUsers = class {
	constructor () {
  	this.openSockets = [];
  }

  addSockets (userId, socketId) {
    let newSocket = {userId, socketId};

  	this.openSockets.push(newSocket);
    return newSocket;
  }

  findSockets (userId) {
  	return this.openSockets.filter((data) => {
    	return data.userId == userId;
    })
  }

  removeSockets (socket) {
  // Returns an array without the disconnected user.
  	let updatedArray = this.openSockets.filter((data) => {
      return data.socketId != socket.id;
    });
   	return this.openSockets = updatedArray;
  }
};

module.exports = {OpenSocketsUsers}
