// Logs in the user if he was offline
var socket = loadSocket();

let checkConnection = {
  initialize: function () {
    document.addEventListener("deviceready", checkConnection.deviceReady, false);
  },

  deviceReady: function () {
    // Event listener when user is online
    document.addEventListener('online', checkConnection.loginUser, false);
  },

  passwordLessLogin: function (socket) {
    socket.emit('passwordlessLogin', {
      uuid: device.uuid
    }, (err, res) => {
      if (err)
        return window.location.href = 'sign-in.html';

      socket.emit('debug', 'succesFull login')
      localStorage.setItem('userUuidGeoapp', res.uuid);
      sessionStorage.setItem('userId', res._id);
      window.location.href = html
    })
  },

  loginUser: function () {
    // quick fix for this.
      window.location.href = "index.html";

    // socket = io.connect('http://192.168.1.250:3000/');
    // let html = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
    //
    // if (sessionStorage.getItem('userId') !== null)
    //   return;
    //
    // if (html === "online" || html === "pending" || html === "all")
    //   html = "main.html"
    //
    // socket.on('userConnected', (data) => {
    //   checkConnection.passwordLessLogin(socket);
    // })
  }
};

checkConnection.initialize();
