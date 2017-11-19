const mongoose = require('mongoose');

let GroupSchema = mongoose.Schema({
  title: String,
  groupImage: String,
  coords: [{
    lat: String,
    lng: String
  }]
});

let Group = mongoose.model('Group', GroupSchema);

module.exports = {Group}
