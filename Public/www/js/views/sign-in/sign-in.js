// View of the sign-in.

var app = app || {};
var socket = socket || io.connect('http://192.168.0.30:3000');

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
        if (err) {
          $('.input-group').removeClass('error');
          if (err.Error === 2) {
            // Name required
            $('.input-group.name').addClass('error');
          } else if (err.Error === 3) {
            // Email required
            $('.input-group.user-email').addClass('error');
          } else if (err.Error === 4) {
            // Duplicate email
            $('.input-group.user-email').addClass('error');
          } else if (err.Error === 5) {
            // Password required
            $('.input-group.password').addClass('error');
          } else if (err.Error === 6) {
            // Password is too short
            $('.input-group.password').addClass('error');
          } else if (err.Error === 0) {
            // Passwords don't match
            $('.input-group.password').addClass('error');
            $('.input-group.repeat-password').addClass('error');
          };
          return
        };


        sessionStorage.setItem('userId', res);
        window.location.href = 'main.html#/online'
      })
    },

    logIn: function () {
      let data = {};
      data.email = $('#email').val().trim();
      data.password = $('#password').val().trim();

      this.socket.emit('loginUser', data, (err, res) => {
        if (err) {
          $('.input-group').removeClass('error');
          if (err.Error === 1) {
            // No user/password found
            $('.input-group.email').addClass('error');
            $('.input-group.password').addClass('error');
          } else if (err.Error === 99) {
            throw Error (err);
          }
          return;
        }

        sessionStorage.setItem('userId', res);
        window.location.href = 'main.html#/all'
      })
    }
  })
  new app.SignInView();
})
