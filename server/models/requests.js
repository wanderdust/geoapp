const mongoose = require('mongoose');

let RequestSchema = mongoose.Schema({
  senderId: 'String',
  recipientId: 'String',
  groupId: 'String'
});

let Request = mongoose.model('Request', RequestSchema);

module.exports = {Request};
