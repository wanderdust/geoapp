// View of the sign-in.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.Splash = Backbone.View.extend({
    el: 'body',

    events: {

    },

    initialize: function () {
      this.socket = socket;
      // Check for saved passwords and if found send automatically login.
      // Random strings to avoid localStorage collision
      this.user = localStorage.getItem('userE1d9rg76397d11');
      this.password = localStorage.getItem('passwordE1d9rg76397d11');

      this.checkLocalStorage(this.user, this.password);
      if (socket.isOnline !== undefined) {
        this.snackBar('Comprueba tu conexión a internet')
      };
      document.addEventListener("deviceready", this.onDeviceReady, false);

    },

    render: function () {

    },

    onDeviceReady: function () {
      if (cordova.platformId == 'android') {
          StatusBar.backgroundColorByHexString("#b47916");
      };

      socket.emit('debug', device.uuid)
    },

    checkLocalStorage: function (user, password) {
      if (user !== null && password !== null) {
        this.socket.emit('loginUser', {
          phone: user,
          password: password,
          // The saved phone already contains the prefix, so we set it as empty.
          prefix: "",
          // Tells the server that it is okay if the prefix field is empty.
          localStorage: true
        }, (err, res) => {
          if (err)
            return window.location.href = 'login.html';
          sessionStorage.setItem('userId', res._id);
          window.location.href = 'main.html#/online'
        })
      } else {
        window.location.href = 'login.html';
      }
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
