// View of the sign-in.

var app = app || {};
var socket = loadSocket();

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
      data.phone = $('#email').val().replace(/\s+/g, '');
      data.password = $('#password').val().trim();
      data.confirmPassword = $('#confirm').val().trim();

      this.socket.emit('createUser', data, (err, res) => {
        if (err) {
          $('.input-group').removeClass('error');
          $('.error-message').addClass('hidden');
          if (err.Error === 2) {
            // Name required
            $('.input-group.name').addClass('error');
            $('.error-name').removeClass('hidden').html(err.Message);
          } else if (err.Error === 3 || err.Error === 7) {
            // Email required
            $('.input-group.user-email').addClass('error');
            $('.error-email').removeClass('hidden').html(err.Message);
          } else if (err.Error === 4) {
            // Duplicate email
            $('.input-group.user-email').addClass('error');
            $('.error-email').removeClass('hidden').html(err.Message);
          } else if (err.Error === 5) {
            // Password required
            $('.input-group.password').addClass('error');
            $('.error-password').removeClass('hidden').html(err.Message);
          } else if (err.Error === 6) {
            // Password is too short
            $('.input-group.password').addClass('error');
            $('.error-password').removeClass('hidden').html(err.Message);
          } else if (err.Error === 0) {
            // Passwords don't match
            $('.input-group.password').addClass('error');
            $('.input-group.repeat-password').addClass('error');
            $('.error-password').removeClass('hidden').html(err.Message);
            $('.error-repeat').removeClass('hidden').html(err.Message);
          };
          return
        };


        sessionStorage.setItem('userId', res._id);
        localStorage.setItem('passwordE1d9rg76397d11', res.password);
        localStorage.setItem('userE1d9rg76397d11', data.phone);
        window.location.href = 'main.html#/online'
      })
    },

    logIn: function () {
      let data = {};
      data.phone = $('#email').val().replace(/\s+/g, '');
      data.password = $('#password').val().trim();

      this.socket.emit('loginUser', data, (err, res) => {
        if (err) {
          $('.input-group').removeClass('error');
          $('.error-message').addClass('hidden');
          if (err.Error === 1) {
            // No user found
            $('.input-group.email').addClass('error');
            $('.error-email').removeClass('hidden').html(err.Message);
          } else if (err.Error === 2) {
            // Wrong password
            $('.input-group.password').addClass('error');
            $('.error-password').removeClass('hidden').html(err.Message);
          } else if (err.Error === 99) {
            throw Error (err);
          }
          return;
        }

        sessionStorage.setItem('userId', res._id);
        // Random strings to avoid localStorage collisions.
        localStorage.setItem('passwordE1d9rg76397d11', res.password);
        localStorage.setItem('userE1d9rg76397d11', data.phone);
        window.location.href = 'main.html#/online'
      })
    }
  })
  new app.SignInView();
})
