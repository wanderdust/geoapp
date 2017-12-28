// View of the sign-in.

var app = app || {};
var socket = socket || io();

$(function () {

  app.SignInView = Backbone.View.extend({
    el: '.login',

    events: {
      "click .sign-in-button": "signIn",
      "click .login-button": "logIn"
    },

    initialize: function () {
      this.socket = socket;
    },

    render: function () {

    },

    signIn: function () {
      let data = {};
      data.name = $('#name').val().trim();
      data.email = $('#email').val().trim();
      data.password = $('#password').val().trim();
      data.confirmPassword = $('#confirm').val().trim();

      this.socket.emit('createUser', data, (err, res) => {
        if (err)
          return console.log(err);

        sessionStorage.setItem('userId', res);
        window.location.href = 'main.html#/online'
      })
    },

    logIn: function () {
      let data = {};
      data.name = $('#name').val().trim();
      data.password = $('#password').val().trim();

      this.socket.emit('loginUser', data, (err, res) => {
        if (err)
          return console.log(err);

        sessionStorage.setItem('userId', res);
        window.location.href = 'main.html#/online'
      })
    }
  })
  new app.SignInView();
})
