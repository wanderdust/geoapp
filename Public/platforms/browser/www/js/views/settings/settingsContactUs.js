// View of the help settings.

var app = app || {};
var socket = socket || io.connect('http://10.40.40.54:3000');

$(function () {

  app.SettingsContactUs = Backbone.View.extend({
    el: '#app-container',

    events: {
      "click #back-arrow-container": "backToMain"
    },

    initialize: function () {
      this.socket = socket;

      // When client connects sends user data to keep track of user.
      socket.emit('connectedClient', sessionStorage.getItem('userId'));
    },

    render: function (model) {

    },

    backToMain: function () {
      window.location.href = 'settings-help.html';
    }
  })

  new app.SettingsContactUs();
})
