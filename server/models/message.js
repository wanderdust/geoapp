const mongoose = require('mongoose');

let MessagesSchema = mongoose.Schema({
  groupId: String,
  messageList: [{
    from: String,
    body: String,
    timeStamp: Number
  }]
});

let Messages = mongoose.model('Messages', MessagesSchema);

module.exports = {Messages}
