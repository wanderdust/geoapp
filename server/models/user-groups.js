const mongoose = require('mongoose');

let UserGroupSchema = mongoose.Schema({
  groupId: String,
  userId: String,
  online: Boolean,
  pending: Boolean
});

let UserGroup = mongoose.model('UserGroup', UserGroupSchema);


module.exports = {UserGroup};
