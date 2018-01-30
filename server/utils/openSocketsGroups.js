let OpenSocketsGroups = class {
	constructor () {
  	this.openSockets = [];
  }

  addSockets (groupId, socketId) {
    let newSocket = {groupId, socketId};

  	this.openSockets.push(newSocket);
    return newSocket;
  }

  findSockets (document) {
  	return this.openSockets.filter((data) => {
    	return data.groupId == document.groupId;
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

module.exports = {OpenSocketsGroups}
