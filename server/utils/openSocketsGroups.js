let OpenSocketsGroups = class {
	constructor () {
  	this.openSockets = [];
  }

  addSockets (groupId, socketId) {

    let newSocket = {groupId, socketId};

		let alreadyExists = this.openSockets.filter((data) => {
			return data.groupId +'' === groupId + '' && socketId +'' === data.socketId + ''
		})

		if (alreadyExists.length > 0) {
			return console.log('already exists');
		}

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
