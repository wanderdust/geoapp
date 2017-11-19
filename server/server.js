const {mongoose} = require('./db/mongoose.js')
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {User} = require('./models/users.js');
const {Group} = require('./models/groups.js');
const {UserGroup} = require('./models/user-groups.js');

const publicPath = path.join(__dirname, '../public');
const PORT = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));


io.on('connection', (socket) => {
  
})

server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`)
});
