// View of the sign-in.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.Splash = Backbone.View.extend({
    el: 'body',

    events: {

    },

    initialize: function () {
      localStorage.clear();
      _.bindAll(this, 'onDeviceReady', 'checkLocalStorage')
      this.socket = socket;
      // Check for saved passwords and if found send automatically login.
      // Random strings to avoid localStorage collision
      this.user = localStorage.getItem('userUuidGeoapp');

      if (socket.isOnline !== undefined) {
        this.snackBar('Comprueba tu conexión a internet')
      };
      document.addEventListener("deviceready", this.onDeviceReady, false);
    },

    render: function () {

    },

    onDeviceReady: function () {
      let uuid = device.uuid;
      if (cordova.platformId == 'android') {
          StatusBar.backgroundColorByHexString("#b47916");
      };
      this.checkLocalStorage(uuid);
    },

    checkLocalStorage: function (uuid) {
      this.socket.emit('passwordlessLogin', {
        uuid: uuid
      }, (err, res) => {
        if (err)
          return window.location.href = 'sign-in.html';

        sessionStorage.setItem('userId', res._id);
        window.location.href = 'main.html#/online'
      })
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
