const mongoose = require('mongoose');

let GroupSchema = mongoose.Schema({
  title: String,
  groupImage: String,
  coords: {
    lat: Number,
    lng: Number
  }
});

let Group = mongoose.model('Group', GroupSchema);

module.exports = {Group}
