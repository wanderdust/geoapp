// View of the sign-in.

var app = app || {};
var socket = socket || io.connect('http://192.168.0.30:3000');

$(function () {

  app.Splash = Backbone.View.extend({
    events: {

    },

    initialize: function () {
      this.socket = socket;
      // Check for saved passwords and if found send automatically login.
      // Random strings to avoid localStorage collision
      this.user = localStorage.getItem('userE1d9rg76397d11');
      this.password = localStorage.getItem('passwordE1d9rg76397d11');

      this.checkLocalStorage(this.user, this.password);
    },

    render: function () {

    },

    checkLocalStorage: function (user, password) {
      if (user !== null && password !== null) {
        this.socket.emit('loginUser', {
          email: user,
          password: password
        }, (err, res) => {
          if (err)
            return window.location.href = 'login.html';
          sessionStorage.setItem('userId', res._id);
          window.location.href = 'main.html#/online'
        })
      } else {
        window.location.href = 'login.html';
      }
    }
  })
  new app.Splash();
})
