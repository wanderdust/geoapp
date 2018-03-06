// View of the account settings.

var app = app || {};
var socket = socket || io.connect('http://10.40.40.54:3000');

$(function () {

  app.AccountChangeMail = Backbone.View.extend({
    el: '#app-container',

    events: {
      "click #back-arrow-container": "backToMain",
      "click .settings-change-email": "getChangeEmail",
      "click .settings-eliminate-account": "getDeleteAccount",
      "click .settings-change-password": "getChangePassword"
    },

    initialize: function () {
      this.socket = socket;
      // When client connects sends user data to keep track of user.
      socket.emit('connectedClient', sessionStorage.getItem('userId'));
    },

    backToMain: function () {
      window.location.href = 'settings.html';
    },

    getChangeEmail: function () {
      window.location.href = 'settings-change-email.html';
    },

    getDeleteAccount: function () {
      window.location.href = 'settings-delete-account.html';
    },

    getChangePassword: function () {
      window.location.href = 'settings-change-password.html';
    }
  })

  new app.AccountChangeMail();
})
