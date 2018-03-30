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
      this.getCountryCode();

      document.addEventListener("deviceready", this.onDeviceReady, false);
    },

    render: function () {

    },

    onDeviceReady: function () {
      this.uuid = device.uuid;
    },

    // Creates new user.
    signIn: function () {
      let data = {};
      data.uuid = device.uuid;
      data.name = $('#name').val().trim();
      data.phone = $('#email').val().replace(/\s+/g, '');
      data.prefix = $('#prefix').val().replace(/\s+/g, '');
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
            // phone required
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
          } else if (err.Error === 8) {
            // phone code required
            $('.input-group.phone-prefix').addClass('error');
            $('.error-email').removeClass('hidden').html(err.Message);
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
        // User's unique device uuid
        localStorage.setItem('userUuidGeoapp', res.uuid);
        window.location.href = 'main.html#/online'
      })
    },

    logIn: function () {
      let data = {};
      data.prefix = $('#prefix').val().replace(/\s+/g, '');
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
          } else if (err.Error === 8) {
            // phone code required
            $('.input-group.phone-prefix').addClass('error');
            $('.error-email').removeClass('hidden').html(err.Message);
          } else if (err.Error === 99) {
            throw Error (err);
          }
          return;
        }

        sessionStorage.setItem('userId', res._id);
        // Random strings to avoid localStorage collisions.
        localStorage.setItem('userUuidGeoapp', res.uuid);
        window.location.href = 'main.html#/online'
      })
    },

    // Gets country code from freegeoip and then gets the country prefix
    // from restcountires
    getCountryCode: async function () {
      let getCountryCode = await $.getJSON('http://freegeoip.net/json/?callback=?');
      let getCountryPrefix = await $.getJSON(`https://restcountries.eu/rest/v2/name/${getCountryCode.country_code}`);
      // Appends the code in the input box
      $('#prefix').val(`+${getCountryPrefix[0].callingCodes[0]}`);
    }
  })
  new app.SignInView();
})
