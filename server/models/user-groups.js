const mongoose = require('mongoose');

let UserGroupSchema = mongoose.Schema({
  groupId: String,
  userId: String,
  online: Boolean,
  pending: Boolean,
  timeStamp: Number
});

let UserGroup = mongoose.model('UserGroup', UserGroupSchema);

module.exports = {UserGroup};
