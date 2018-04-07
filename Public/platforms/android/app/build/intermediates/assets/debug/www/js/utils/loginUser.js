// Logs in the user if he was offline
var socket = loadSocket();

let checkConnection = {
  initialize: function () {
    document.addEventListener("deviceready", checkConnection.deviceReady, false);
  },

  deviceReady: function () {
    // Event listener when user is online
    document.addEventListener('online', checkConnection.loginUser, false);
    checkConnection.initialConnection = checkConnection.checkConnectionType();
  },

  passwordLessLogin: function (socket) {
    socket.emit('passwordlessLogin', {
      uuid: device.uuid
    }, (err, res) => {
      if (err)
        return window.location.href = 'sign-in.html';

      localStorage.setItem('userUuidGeoapp', res.uuid);
      sessionStorage.setItem('userId', res._id);
      window.location.href = html
    })
  },

  loginUser: function () {
    // quick fix for this.
    let isOnline = (network) => {
      if (network === Connection.NONE) {
        return false
      } else {
        return true
      }
    }

    if (isOnline(checkConnection.checkConnectionType()) !== isOnline(checkConnection.initialConnection))
      window.location.href = "index.html";

    // socket = io.connect('https://pacific-scrubland-87047.herokuapp.com');
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
  },

  checkConnectionType: function () {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    return networkState
  }
};

checkConnection.initialize();
