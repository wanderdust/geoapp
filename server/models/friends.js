// Requests between friends

const mongoose = require('mongoose');

let FriendSchema = mongoose.Schema({
  userId: 'String',
  friendId: 'String',
  status: 'String'
});

let Friend = mongoose.model('Friend', FriendSchema);

module.exports = {Friend}
