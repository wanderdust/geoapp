let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/GeoApp', { useMongoClient: true });
mongoose.Promise = global.Promise;

module.exports = {mongoose}
