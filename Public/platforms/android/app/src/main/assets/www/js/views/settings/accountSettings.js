// View of the account settings.

var app = app || {};
var socket = loadSocket();

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
      socket.emit('connectedClient', {
        id: sessionStorage.getItem('userId'),
        token: sessionStorage.getItem('token')
      }, (err, res) => {
        if (err) {
          if (err.Error === 401)
            return window.location.href = 'index.html'
          return
        }
        return
      });
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
