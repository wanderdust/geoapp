// View of the sign-in.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.Splash = Backbone.View.extend({
    el: 'body',

    events: {

    },

    initialize: function () {
      _.bindAll(this, 'onDeviceReady', 'checkLocalStorage', 'offlineLogin')
      this.socket = socket;
      // Check for saved passwords and if found send automatically login.
      this.user = localStorage.getItem('userUuidGeoapp');

      document.addEventListener("deviceready", this.onDeviceReady, false);
    },

    render: function () {

    },

    onDeviceReady: function () {
      let uuid = device.uuid;
      if (cordova.platformId == 'android') {
          StatusBar.backgroundColorByHexString("#b47916");
      };
      this.checkConnection();

      if(this.checkConnection() === Connection.NONE) {
        this.snackBar('Comprueba tu conexión a internet');
        this.offlineLogin(uuid);
        return
      }
      this.checkLocalStorage(uuid);
    },

    checkLocalStorage: function (uuid) {
      this.socket.emit('passwordlessLogin', {
        uuid: uuid
      }, (err, res) => {
        if (err)
          return window.location.href = 'sign-in.html';

        localStorage.setItem('userUuidGeoapp', res.uuid);
        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('userId', res._id);
        window.location.href = 'main.html#/online'
      })
    },

    offlineLogin: function (uuid) {
      let cachedUuid = localStorage.getItem('userUuidGeoapp');

      if (uuid !== cachedUuid)
        return this.snackBar('No se ha podido iniciar sesión. Inténtalo de nuevo cuando tengas conexión a internet');

      window.location.href = 'main.html#/online'
    },

    checkConnection: function () {
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
    },

    snackBar: function (message) {
      let x = this.$("#snackbar");
      x.html(message);
      x.addClass('show');
      setTimeout(function(){ x.removeClass('show'); }, 3000);
    }
  })
  new app.Splash();
})
